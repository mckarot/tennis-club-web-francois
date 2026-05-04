'use server';

/**
 * Server Actions pour le Dashboard Membre
 * Tennis Club du François
 */

import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from '@/lib/types/actions';
import { format, startOfToday, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Types pour le Dashboard Membre
 */
export type MemberDashboardData = {
  profile: {
    nom: string;
    prenom: string;
    role: string;
    avatar_url?: string;
  };
  nextReservation: {
    court_nom: string;
    court_type: string;
    date_heure_debut: string;
    partner_name?: string;
  } | null;
  courtsStatus: {
    id: string;
    nom: string;
    type: string;
    isOccupied: boolean;
    isInMaintenance: boolean;
  }[];
  clubEvent: {
    title: string;
    description: string;
    category: string;
    image?: string;
    participantsCount: number;
    link?: string;
  } | null;
};

/**
 * Récupère toutes les données nécessaires pour le dashboard membre
 */
export async function getMemberDashboardData(): Promise<ActionResult<MemberDashboardData>> {
  const pb = await createClient();
  
  // 1. Authentification
  const user = pb.authStore.model;
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };
  }

  const adminPb = await createAdminClient();

  try {
    console.log('[Member Dashboard] Entrée dans getMemberDashboardData...');
    
    // 2. Profil
    console.log('[Member Dashboard] Récupération du profil pour user:', user.id);
    let profile;
    try {
      profile = await adminPb.collection('profiles').getFirstListItem(`user="${user.id}"`);
    } catch (profileError: any) {
      console.error('[Member Dashboard] Erreur lors de la récupération du profil:', profileError);
      throw profileError;
    }
    console.info('[Member Dashboard] Profil récupéré avec succès:', profile);

    // 3. Prochaine Réservation
    const now = new Date().toISOString();
    console.log('[Member Dashboard] Récupération de la prochaine réservation...');
    let reservations;
    try {
      const records = await adminPb.collection('reservations').getList(1, 1, {
        filter: `user="${user.id}" && date_heure_debut > "${now}" && statut="confirmee"`,
        sort: 'date_heure_debut',
        expand: 'court'
      });
      reservations = records.items;
    } catch (resError: any) {
      console.error('[Member Dashboard] Erreur lors de la récupération des réservations:', resError);
    }

    const nextRes = reservations && reservations.length > 0 ? {
      court_nom: (reservations[0] as any).expand?.court?.nom,
      court_type: (reservations[0] as any).expand?.court?.type_surface,
      date_heure_debut: (reservations[0] as any).date_heure_debut,
    } : null;
    
    if (nextRes) {
      console.info('[Member Dashboard] Prochaine réservation trouvée:', nextRes);
    } else {
      console.log('[Member Dashboard] Aucune réservation à venir pour cet utilisateur.');
    }

    // 4. État des courts EN DIRECT
    console.log('[Member Dashboard] Récupération de l\'état actuel des courts...');
    let courts;
    try {
      courts = await adminPb.collection('courts').getFullList();
    } catch (courtsError: any) {
      console.error('[Member Dashboard] Erreur lors de la récupération des courts:', courtsError);
      throw courtsError;
    }

    let activeResa;
    try {
      activeResa = await adminPb.collection('reservations').getFullList({
        filter: `date_heure_debut <= "${now}" && date_heure_fin >= "${now}" && statut="confirmee"`
      });
    } catch (activeResaError: any) {
      console.warn('[Member Dashboard] Attention: erreur lors du check d\'occupation:', activeResaError);
    }

    const occupiedCourtIds = new Set(activeResa?.map(r => (r as any).court) || []);

    const courtsStatus = courts.map(c => ({
      id: c.id.toString(),
      nom: (c as any).nom,
      type: (c as any).type_surface,
      isOccupied: occupiedCourtIds.has(c.id),
      isInMaintenance: (c as any).statut === 'maintenance'
    }));
    
    // 5. Événement du Club
    let clubEvent = null;
    try {
      const eventRecords = await adminPb.collection('club_events').getList(1, 1, {
        filter: 'is_active = true',
        sort: '-created'
      });
      
      if (eventRecords.items.length > 0) {
        const e = eventRecords.items[0];
        clubEvent = {
          title: e.title,
          description: e.description,
          category: e.category,
          image: e.image ? `${process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL}/api/files/${e.collectionId}/${e.id}/${e.image}` : undefined,
          participantsCount: e.participants_count || 0,
          link: e.link || undefined
        };
      }
    } catch (eventError) {
      console.warn('[Member Dashboard] Erreur lors de la récupération de l\'événement:', eventError);
    }

    return {
      success: true,
      data: {
        profile: profile as any,
        nextReservation: nextRes,
        courtsStatus,
        clubEvent
      }
    };

  } catch (error: any) {
    console.error('Error fetching member dashboard data:', error);
    return { success: false, error: 'Erreur lors du chargement des données', code: 'INTERNAL_ERROR' };
  }
}

/**
 * Récupère les créneaux disponibles pour un court et une date donnés
 */
export async function getAvailableSlots(courtId: string, dateStr: string): Promise<string[]> {
  const adminPb = await createAdminClient();
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);

  console.log(`[Reservation System] Vérification des créneaux pour Court ${courtId} le ${dateStr}`);

  let reservations;
  try {
    reservations = await adminPb.collection('reservations').getFullList({
      filter: `court="${courtId}" && date_heure_debut >= "${start.toISOString()}" && date_heure_debut <= "${end.toISOString()}" && statut="confirmee"`
    });
  } catch (error: any) {
    console.error("[Reservation System] Erreur lors de la récupération des créneaux:", error);
    return [];
  }

  const occupiedHours = new Set(reservations?.map(r => new Date((r as any).date_heure_debut).getHours()) || []);
  
  // Créneaux de 7h à 22h
  const allHours = Array.from({ length: 16 }, (_, i) => i + 7);
  const availableSlots = allHours
    .filter(h => !occupiedHours.has(h))
    .map(h => `${h.toString().padStart(2, '0')}:00`);

  return availableSlots;
}

/**
 * Crée une réservation pour le membre connecté
 */
export async function createMemberReservation(formData: {
  courtId: string;
  startTime: string;
  endTime: string;
}): Promise<ActionResult<any>> {
  const pb = await createClient();
  const adminPb = await createAdminClient();
  
  // 1. Auth check
  const user = pb.authStore.model;
  if (!user) return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };

  try {
    const courtId = formData.courtId;
    console.info(`[Reservation System] Tentative de réservation: Court ${courtId}, User ${user.id}, Heure ${formData.startTime}`);

    // 2. Double check availability (Race condition protection)
    let existing;
    try {
      existing = await adminPb.collection('reservations').getFirstListItem(`court="${courtId}" && date_heure_debut="${formData.startTime}" && statut="confirmee"`);
    } catch (e) {
      // Not found is fine
    }

    if (existing) {
      return { success: false, error: 'Ce créneau vient d\'être réservé par un autre membre.', code: 'CONFLICT' };
    }

    // 3. Insert
    try {
      await adminPb.collection('reservations').create({
        court: courtId,
        user: user.id,
        date_heure_debut: formData.startTime,
        date_heure_fin: formData.endTime,
        statut: 'confirmee',
        notes: 'Réservation directe via Dashboard Membre'
      });
    } catch (insertError: any) {
      console.error('[Reservation System] Erreur PocketBase:', insertError);
      throw insertError;
    }

    console.info(`[Reservation System] ✅ Réservation réussie pour Court ${courtId}`);
    
    revalidatePath('/dashboard/membre');
    return { success: true, data: { message: 'Réservation confirmee' } };

  } catch (error: any) {
    console.error('[Reservation System] ❌ Erreur fatale lors de la réservation:', error);
    return { success: false, error: error.message || 'Une erreur technique est survenue.', code: 'INTERNAL_ERROR' };
  }
}

/**
 * Types pour les réservations du membre
 */
export type UserReservation = {
  id: string;
  courtName: string;
  courtType: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
};

export type ReservationStats = {
  totalHours: number;
  upcomingCount: number;
};

export type MyReservationsData = {
  upcoming: UserReservation[];
  past: UserReservation[];
  stats: ReservationStats;
};

/**
 * Récupère toutes les réservations du membre connecté
 */
export async function getMyReservations(): Promise<ActionResult<MyReservationsData>> {
  const pb = await createClient();
  const user = pb.authStore.model;
  
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };
  }

  const adminPb = await createAdminClient();

  try {
    const now = new Date();
    const records = await adminPb.collection('reservations').getFullList({
      filter: `user="${user.id}"`,
      sort: '-date_heure_debut',
      expand: 'court'
    });

    const upcoming: UserReservation[] = [];
    const past: UserReservation[] = [];
    let totalMinutes = 0;

    records.forEach((r: any) => {
      const startTime = new Date(r.date_heure_debut);
      const endTime = new Date(r.date_heure_fin);
      
      const res: UserReservation = {
        id: r.id,
        courtName: r.expand?.court?.nom || 'Court inconnu',
        courtType: r.expand?.court?.type_surface || 'Surface inconnue',
        startTime: r.date_heure_debut,
        endTime: r.date_heure_fin,
        status: r.statut,
        notes: r.notes,
      };

      if (startTime > now) {
        upcoming.push(res);
      } else {
        past.push(res);
        if (r.statut === 'confirmee' || r.statut === 'effectuee') {
          totalMinutes += (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        }
      }
    });

    return {
      success: true,
      data: {
        upcoming: upcoming.reverse(), // Du plus proche au plus lointain
        past: past.slice(0, 10),
        stats: {
          totalHours: Math.round(totalMinutes / 60),
          upcomingCount: upcoming.length,
        }
      }
    };
  } catch (error: any) {
    console.error('[getMyReservations] Erreur:', error);
    return { success: false, error: 'Erreur lors de la récupération des réservations', code: 'INTERNAL_ERROR' };
  }
}
