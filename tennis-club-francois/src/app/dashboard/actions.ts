/**
 * Server Actions pour le Dashboard Admin
 * Tennis Club du François - Gestion des réservations et membres
 * 
 * Zero-Trust Security Pattern:
 * - Session vérifiée via PocketBase UNIQUEMENT
 * - Rôle admin requis pour toutes les actions
 * - Validation Zod stricte de toutes les entrées
 * - Réponses uniformes avec codes d'erreur standardisés
 */

'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { ActionResult, ErrorCode } from '@/lib/types/actions';
import type {
  DashboardData,
  DashboardStats,
  CourtWithOccupation,
  ReservationWithDetails,
  MemberWithProfile,
} from '@/lib/types/dashboard';
import {
  reservationsFilterSchema,
  membersFilterSchema,
  createReservationForUserSchema,
  blockCourtSchema,
} from '@/lib/validators/dashboard';
import { addMemberSchema } from '@/lib/validators/members';

// ============================================================================
// HELPERS DE SÉCURITÉ
// ============================================================================

/**
 * Vérifie que l'utilisateur connecté est authentifié et admin
 * Zero-Trust: Session récupérée via PocketBase server (Zero-Trust)
 * 
 * @returns La session utilisateur si admin
 * @throws {Error} UNAUTHORIZED si non authentifié
 * @throws {Error} FORBIDDEN si rôle insuffisant
 */
async function requireAdmin() {
  const pb = await createClient();
  
  if (!pb.authStore.isValid || !pb.authStore.model) {
    const error = new Error('Non authentifié');
    (error as { code?: ErrorCode }).code = 'UNAUTHORIZED';
    throw error;
  }
  
  const user = pb.authStore.model;
  
  // Vérification du rôle admin dans profiles
  try {
    const profile = await pb.collection('profiles')
      .getFirstListItem(`user="${user.id}"`);
    
    if (profile.role !== 'admin') {
      const error = new Error('Rôle insuffisant - Accès admin requis');
      (error as { code?: ErrorCode }).code = 'FORBIDDEN';
      throw error;
    }
    
    return user;
  } catch (err) {
    const error = new Error('Profil introuvable ou rôle insuffisant');
    (error as { code?: ErrorCode }).code = 'FORBIDDEN';
    throw error;
  }
}

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
function createErrorResponse<T = never>(
  message: string,
  code: ErrorCode,
  details?: Record<string, string[]>
): ActionResult<T> {
  return { success: false, error: message, code, details };
}

/**
 * Helper pour créer une réponse de succès standardisée
 */
function createSuccessResponse<T>(
  data: T,
  message?: string
): ActionResult<T> {
  return { success: true, data, message };
}

// ============================================================================
// SERVER ACTION 1: getAdminDashboardData
// ============================================================================

/**
 * Récupère toutes les données pour le Dashboard Admin
 */
export async function getAdminDashboardData(): Promise<ActionResult<DashboardData>> {
  console.log('[Admin Dashboard] Entrée dans getAdminDashboardData...');
  try {
    // Vérification admin (Zero-Trust)
    const adminUser = await requireAdmin();
    console.log('[Admin Dashboard] Vérification admin réussie.');
    
    const pb = await createAdminClient();
    
    // Récupération du profil admin pour l'affichage header
    const adminProfile = await pb.collection('profiles').getFirstListItem(`user="${adminUser.id}"`);
    const pbUrl = process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL || '';
    const adminAvatarUrl = adminProfile.avatar_url 
      ? `${pbUrl}/api/files/${adminProfile.collectionId}/${adminProfile.id}/${adminProfile.avatar_url}`
      : null;
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Récupération des statistiques en parallèle
    const [
      membresList,
      reservationsList,
      courts,
      reservationsAujourdhuiList,
    ] = await Promise.all([
      // Total membres
      pb.collection('profiles').getList(1, 1, { filter: 'role="membre"' }),
      
      // Total réservations
      pb.collection('reservations').getList(1, 1),
      
      // État des courts
      pb.collection('courts').getFullList({ sort: 'nom' }),
      
      // Réservations du jour
      pb.collection('reservations').getList(1, 1, {
        filter: `date_heure_debut >= "${today}" && date_heure_debut < "${tomorrow}"`
      }),
    ]);

    const stats: DashboardStats = {
      totalMembres: membresList.totalItems,
      totalReservations: reservationsList.totalItems,
      courtsOccupes: (courts || []).filter((c) => c.statut !== 'disponible').length,
      courtsDisponibles: (courts || []).filter((c) => c.statut === 'disponible').length,
      reservationsAujourdhui: reservationsAujourdhuiList.totalItems,
    };
    
    // Dernières réservations avec expansion
    const rawReservations = await pb.collection('reservations').getList(1, 10, {
      sort: '-date_heure_debut',
      expand: 'court,user'
    });

    const userIds = Array.from(new Set((rawReservations?.items || []).map(r => r.user).filter(Boolean)));
    const userProfiles = userIds.length > 0 
      ? await pb.collection('profiles').getFullList({
          filter: userIds.map(id => `user="${id}"`).join(' || ')
        })
      : [];

    const dernieresReservations: ReservationWithDetails[] = (rawReservations?.items || []).map(r => {
      const p = userProfiles.find(prof => prof.user === r.user);
      const court = r.expand?.court;
      return {
        id: r.id,
        date_heure_debut: r.date_heure_debut,
        date_heure_fin: r.date_heure_fin,
        status: r.statut,
        notes: r.notes || null,
        court: {
          nom: court?.nom || 'Inconnu',
          type: court?.type_surface || 'Inconnu'
        },
        user: {
          nom: p?.nom || 'Inconnu',
          prenom: p?.prenom || null,
          email: r.expand?.user?.email || null 
        }
      };
    });

    // Membres récents
    const profilesData = await pb.collection('profiles').getList(1, 10, {
      filter: 'role="membre"',
      sort: '-created',
      expand: 'user'
    });

    // Récupérer les member_profiles en parallèle
    const profileIds = (profilesData?.items || []).map(p => p.user).filter(Boolean);
    const memberProfiles = profileIds.length > 0 
      ? await pb.collection('member_profiles').getFullList({
          filter: profileIds.map(id => `user="${id}"`).join(' || ')
        })
      : [];

    const membresRecentsFormatted: MemberWithProfile[] = (profilesData?.items || []).map(p => {
      const userData = p.expand?.user;
      const mp = memberProfiles.find(m => m.user === p.user);

      return {
        user: p.user,
        email: userData?.email || '',
        nom: p.nom,
        prenom: p.prenom,
        role: p.role,
        telephone: mp?.telephone || null,
        niveau_tennis: mp?.niveau_tennis || null,
        statut_adhesion: mp?.statut_adhesion || null,
        created: p.created,
      };
    });

    // Formatter les courts pour correspondre au type CourtWithOccupation
    const formattedCourts: CourtWithOccupation[] = (courts || []).map(c => ({
      id: c.id,
      nom: c.nom,
      type: c.type_surface || 'Inconnu',
      disponible: c.statut === 'disponible',
      eclairage: !!c.eclaire,
      status: c.statut,
    }));

    return createSuccessResponse<DashboardData>({
      stats,
      courts: formattedCourts,
      dernieresReservations,
      membresRecents: membresRecentsFormatted,
      adminProfile: {
        fullName: `${adminProfile.prenom || ''} ${adminProfile.nom || ''}`.trim() || 'Admin',
        avatarUrl: adminAvatarUrl,
      }
    });
    
  } catch (error) {
    console.error(`[Admin Dashboard] ERREUR FATALE:`, error);
    return createErrorResponse('Erreur lors de la récupération des données', 'INTERNAL_ERROR');
  }
}

// ============================================================================
// SERVER ACTION 2: getAllCourtsAction
// ============================================================================

export async function getAllCourtsAction(): Promise<ActionResult<CourtWithOccupation[]>> {
  try {
    await requireAdmin();
    const pb = await createAdminClient();
    const now = new Date().toISOString();
    
    const courts = await pb.collection('courts').getFullList({ sort: 'nom' });
    
    const courtsWithOccupation: CourtWithOccupation[] = await Promise.all(
      courts.map(async (court) => {
        const occupation = await pb.collection('reservations').getFirstListItem(
          `court="${court.id}" && statut="confirmee" && date_heure_debut<="${now}" && date_heure_fin>="${now}"`,
          { expand: 'user' }
        ).catch(() => null);
        
        // Récupérer le profil pour l'occupation
        let userProfile = null;
        if (occupation) {
           userProfile = await pb.collection('profiles').getFirstListItem(`user="${occupation.user}"`).catch(() => null);
        }
        
        const mappedCourt: CourtWithOccupation = {
          id: court.id,
          nom: court.nom,
          type: court.type_surface || 'Inconnu',
          disponible: court.statut === 'disponible',
          eclairage: !!court.eclaire,
          status: court.statut,
          occupation: occupation ? {
            date_heure_debut: occupation.date_heure_debut,
            date_heure_fin: occupation.date_heure_fin,
            user: {
              id: occupation.user,
              nom: userProfile?.nom || null,
              prenom: userProfile?.prenom || null,
              email: occupation.expand?.user?.email || null,
            },
          } : undefined,
        };
        
        return mappedCourt;
      })
    );
    
    return createSuccessResponse(courtsWithOccupation);
    
  } catch (error) {
    console.error('[Dashboard Admin] getAllCourtsAction error:', error);
    return createErrorResponse('Erreur lors de la récupération des courts', 'INTERNAL_ERROR');
  }
}

// ============================================================================
// SERVER ACTION 3: getAllReservationsAction
// ============================================================================

export async function getAllReservationsAction(
  filters?: {
    start_date?: string;
    end_date?: string;
    court?: string;
    status?: string;
  }
): Promise<ActionResult<ReservationWithDetails[]>> {
  try {
    await requireAdmin();
    const validatedFilters = reservationsFilterSchema.safeParse(filters || {});
    
    if (!validatedFilters.success) {
      return createErrorResponse('Filtres invalides', 'VALIDATION_ERROR');
    }
    
    const pb = await createAdminClient();
    
    let filterParts = [];
    if (validatedFilters.data.start_date) filterParts.push(`date_heure_debut >= "${validatedFilters.data.start_date}"`);
    if (validatedFilters.data.end_date) filterParts.push(`date_heure_debut <= "${validatedFilters.data.end_date}"`);
    if (validatedFilters.data.court) filterParts.push(`court = "${validatedFilters.data.court}"`);
    if (validatedFilters.data.status) filterParts.push(`statut = "${validatedFilters.data.status}"`);
    
    const reservations = await pb.collection('reservations').getFullList({
      filter: filterParts.join(' && '),
      sort: '-date_heure_debut',
      expand: 'court,user'
    });

    // Récupérer les profils pour les noms
    const userIds = Array.from(new Set(reservations.map(r => r.user).filter(Boolean)));
    const profiles = userIds.length > 0
      ? await pb.collection('profiles').getFullList({
          filter: userIds.map(id => `user="${id}"`).join('||')
        })
      : [];
    
    const formatted: ReservationWithDetails[] = reservations.map(r => {
      const p = profiles.find(prof => prof.user === r.user);
      return {
        id: r.id,
        date_heure_debut: r.date_heure_debut,
        date_heure_fin: r.date_heure_fin,
        status: r.statut,
        notes: r.notes || null,
        court: {
          nom: r.expand?.court?.nom || 'Inconnu',
          type: r.expand?.court?.type_surface || 'Inconnu'
        },
        user: {
          nom: p?.nom || 'Inconnu',
          prenom: p?.prenom || null,
          email: r.expand?.user?.email || null
        }
      };
    });
    
    return createSuccessResponse(formatted);
    
  } catch (error) {
    console.error('[Dashboard Admin] getAllReservationsAction error:', error);
    return createErrorResponse('Erreur lors de la récupération des réservations', 'INTERNAL_ERROR');
  }
}

// ============================================================================
// SERVER ACTION 4: createReservationForUserAction
// ============================================================================

export async function createReservationForUserAction(
  state: ActionResult<{ reservation: ReservationWithDetails }>,
  formData: FormData
): Promise<ActionResult<{ reservation: ReservationWithDetails }>> {
  try {
    await requireAdmin();
    const pb = await createClient();
    
    const rawData = {
      court: formData.get('court'),
      user: formData.get('user'),
      date_heure_debut: formData.get('start_time'),
      date_heure_fin: formData.get('end_time'),
      status: formData.get('status') || 'confirmee',
      notes: formData.get('notes') || '',
    };
    
    const validatedData = createReservationForUserSchema.safeParse(rawData);
    if (!validatedData.success) return createErrorResponse('Données invalides', 'VALIDATION_ERROR', validatedData.error.flatten().fieldErrors);
    
    // Vérifier les conflits
    const conflicts = await pb.collection('reservations').getList(1, 1, {
      filter: `court="${validatedData.data.court}" && statut="confirmee" && date_heure_debut < "${validatedData.data.date_heure_fin}" && date_heure_fin > "${validatedData.data.date_heure_debut}"`
    });
    
    if (conflicts.totalItems > 0) return createErrorResponse('Ce créneau est déjà réservé', 'CONFLICT');
    
    const reservation = await pb.collection('reservations').create({
      court: validatedData.data.court,
      user: validatedData.data.user,
      date_heure_debut: new Date(validatedData.data.date_heure_debut).toISOString(),
      date_heure_fin: new Date(validatedData.data.date_heure_fin).toISOString(),
      statut: validatedData.data.status,
      notes: validatedData.data.notes,
    }, { expand: 'court,user' });

    const profile = await pb.collection('profiles').getFirstListItem(`user="${validatedData.data.user}"`);

    const formatted: ReservationWithDetails = {
      id: reservation.id,
      date_heure_debut: reservation.date_heure_debut,
      date_heure_fin: reservation.date_heure_fin,
      status: reservation.statut,
      notes: reservation.notes || null,
      court: {
        nom: reservation.expand?.court?.nom || 'Inconnu',
        type: reservation.expand?.court?.type_surface || 'Inconnu'
      },
      user: {
        email: reservation.expand?.user?.email || null,
        nom: profile.nom,
        prenom: profile.prenom || null
      }
    };

    revalidatePath('/dashboard/admin', 'layout');
    return createSuccessResponse({ reservation: formatted }, 'Réservation créée avec succès');
    
  } catch (error) {
    console.error('[Dashboard Admin] createReservationForUserAction error:', error);
    return createErrorResponse('Erreur lors de la création de la réservation', 'INTERNAL_ERROR');
  }
}

// ============================================================================
// SERVER ACTION 5: blockCourtAction
// ============================================================================

export async function blockCourtAction(
  state: ActionResult<void>,
  formData: FormData
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    const pb = await createClient();

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);
    
    const rawData = {
      court: formData.get('court'),
      date_heure_debut: formData.get('start_time') || now.toISOString(),
      date_heure_fin: formData.get('end_time') || oneHourLater.toISOString(),
      reason: formData.get('reason') || 'maintenance',
    };

    const validatedData = blockCourtSchema.safeParse(rawData);
    if (!validatedData.success) return createErrorResponse('Données invalides', 'VALIDATION_ERROR', validatedData.error.flatten().fieldErrors);
    
    await pb.collection('reservations').create({
      court: validatedData.data.court,
      user: pb.authStore.model?.id,
      date_heure_debut: validatedData.data.date_heure_debut,
      date_heure_fin: validatedData.data.date_heure_fin,
      statut: 'confirmee',
      notes: `BLOCAGE MAINTENANCE: ${validatedData.data.reason}`,
    });
    
    await pb.collection('courts').update(validatedData.data.court.toString(), { 
      statut: 'maintenance'
    });

    revalidatePath('/dashboard/admin', 'layout');
    return createSuccessResponse(undefined, 'Court bloqué avec succès');
    
  } catch (error) {
    console.error('[Dashboard Admin] blockCourtAction error:', error);
    return createErrorResponse('Erreur lors du blocage du court', 'INTERNAL_ERROR');
  }
}

// ============================================================================
// SERVER ACTION 6: getMembersAction
// ============================================================================

export async function getMembersAction(
  filters?: {
    search?: string;
    role?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ActionResult<{ members: MemberWithProfile[]; total: number }>> {
  try {
    await requireAdmin();
    const validatedFilters = membersFilterSchema.safeParse(filters || {});
    if (!validatedFilters.success) return createErrorResponse('Filtres invalides', 'VALIDATION_ERROR');

    const pb = await createAdminClient();
    const { search, role, limit, offset } = validatedFilters.data;

    let filterParts = [];
    if (role) filterParts.push(`role = "${role}"`);
    if (search) filterParts.push(`(nom ~ "${search}" || prenom ~ "${search}")`);
    
    const page = Math.floor((offset || 0) / (limit || 50)) + 1;
    const result = await pb.collection('profiles').getList(page, limit || 50, {
      filter: filterParts.join(' && '),
      sort: '-created',
      expand: 'user'
    });

    const userIds = result.items.map(p => p.user).filter(Boolean);
    const memberProfiles = userIds.length > 0 
      ? await pb.collection('member_profiles').getFullList({
          filter: userIds.map(id => `user="${id}"`).join('||')
        })
      : [];

    const membersFormatted: MemberWithProfile[] = result.items.map((m) => {
      const mp = memberProfiles.find(p => p.user === m.user);
      return {
        user: m.user,
        email: m.expand?.user?.email || '',
        nom: m.nom,
        prenom: m.prenom,
        role: m.role,
        telephone: mp?.telephone || null,
        niveau_tennis: mp?.niveau_tennis || null,
        statut_adhesion: mp?.statut_adhesion || 'actif',
        created: m.created,
      };
    });

    return createSuccessResponse({
      members: membersFormatted,
      total: result.totalItems,
    });

  } catch (error) {
    console.error('[getMembersAction] error:', error);
    return createErrorResponse('Erreur lors de la récupération des membres', 'INTERNAL_ERROR');
  }
}

// ============================================================================
// SERVER ACTION 7: addMemberAction
// ============================================================================

export async function addMemberAction(
  state: ActionResult<{ user: { id: string; email: string } }>,
  formData: FormData
): Promise<ActionResult<{ user: { id: string; email: string } }>> {
  try {
    await requireAdmin();
    const pbAdmin = await createAdminClient();

    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      telephone: formData.get('telephone'),
      niveau_tennis: formData.get('niveau_tennis'),
    };

    const validatedData = addMemberSchema.safeParse(rawData);
    if (!validatedData.success) return createErrorResponse('Données invalides', 'VALIDATION_ERROR');

    const { email, password, nom, prenom, telephone, niveau_tennis } = validatedData.data;

    const user = await pbAdmin.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name: `${prenom} ${nom}`.trim(),
      role: 'membre',
      emailVisibility: true,
    });

    await pbAdmin.collection('profiles').create({
      user: user.id,
      nom,
      prenom,
      role: 'membre'
    });

    await pbAdmin.collection('member_profiles').create({
      user: user.id,
      telephone: telephone || null,
      niveau_tennis: niveau_tennis || null,
      statut_adhesion: 'actif'
    });

    revalidatePath('/dashboard/admin', 'layout');
    return createSuccessResponse({ user: { id: user.id, email: user.email } }, 'Membre créé avec succès');

  } catch (error: any) {
    console.error('[Admin Dashboard] addMemberAction error:', error);
    return createErrorResponse(error.message || 'Erreur lors de l\'ajout du membre', 'INTERNAL_ERROR');
  }
}

export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    const pb = await createClient();
    pb.authStore.clear();

    const cookieStore = await cookies();
    cookieStore.delete('pb_auth');

    revalidatePath('/', 'layout');
    return createSuccessResponse(undefined, 'Déconnexion réussie');
  } catch (error) {
    return createErrorResponse('Erreur lors de la déconnexion', 'INTERNAL_ERROR');
  }
}
