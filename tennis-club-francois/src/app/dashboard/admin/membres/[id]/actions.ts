'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types/actions';

export async function updateMemberProfileAction(
  prevState: ActionResult<any>,
  formData: FormData
): Promise<ActionResult<any>> {
  const pb = await createClient();
  
  // Vérification de sécurité de base
  if (!pb.authStore.isValid) return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };

  // Utilisation du client ADMIN pour les modifications
  const adminPb = await createAdminClient();

  const memberId = formData.get('memberId') as string;
  const nom = formData.get('nom') as string;
  const prenom = formData.get('prenom') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;
  const level = formData.get('level') as string;
  const typeAbonnement = formData.get('typeAbonnement') as string;
  const statutAdhesion = formData.get('statutAdhesion') as string;

  try {
    // 1. Mettre à jour le profil de base (profiles) - INDISPENSABLE
    let profile;
    try {
      profile = await adminPb.collection('profiles').getFirstListItem(`user="${memberId}"`);
    } catch (e) {
      profile = await adminPb.collection('profiles').getOne(memberId);
    }

    await adminPb.collection('profiles').update(profile.id, {
      nom,
      prenom,
      role
    });

    // 2. Mettre à jour le profil métier (member_profiles) - OPTIONNEL (ne doit pas tout faire planter)
    const realUserId = profile.user;
    try {
      let memberProfile;
      try {
        memberProfile = await adminPb.collection('member_profiles').getFirstListItem(`user="${realUserId}"`);
        await adminPb.collection('member_profiles').update(memberProfile.id, {
          telephone: phone,
          niveau_tennis: level,
          type_abonnement: typeAbonnement,
          statut_adhesion: statutAdhesion
        });
      } catch (e) {
        // Création si inexistant
        await adminPb.collection('member_profiles').create({
          user: realUserId,
          telephone: phone,
          niveau_tennis: level,
          type_abonnement: typeAbonnement,
          statut_adhesion: statutAdhesion
        });
      }
    } catch (memberError: any) {
      console.warn('Erreur non-bloquante sur member_profiles:', memberError.data);
      // On continue quand même car le profil principal est à jour
    }

    revalidatePath(`/dashboard/admin/membres/${memberId}`);
    return { success: true, message: 'Profil mis à jour avec succès' };
  } catch (error: any) {
    console.error('Erreur critique updateMemberProfileAction:', error);
    // On renvoie les détails de validation si disponibles
    const details = error.data?.data ? JSON.stringify(error.data.data) : '';
    return { 
      success: false, 
      error: `${error.message} ${details}`.trim() || 'Erreur lors de la mise à jour' 
    };
  }
}

export async function getAdminMemberProfile(memberId: string) {
  const pb = await createClient();
  
  if (!pb.authStore.isValid) throw new Error('Non authentifié');
  const user = pb.authStore.model;
  if (!user) throw new Error('Non authentifié');

  try {
    // 1. Infos de base du profil membre
    const profile = await pb.collection('profiles')
      .getFirstListItem(`user="${memberId}"`, {
        expand: 'user'
      });

    const memberProfile = await pb.collection('member_profiles')
      .getFirstListItem(`user="${memberId}"`)
      .catch(() => null);

    // 2. Historique complet des réservations (toutes)
    const now = new Date().toISOString().replace('T', ' ');
    const pastReservations = await pb.collection('reservations')
      .getFullList({
        filter: `user="${memberId}" && date_heure_debut < "${now}"`,
        sort: '-date_heure_debut',
        expand: 'court',
      });

    // 3. Réservations à venir
    const upcomingReservations = await pb.collection('reservations')
      .getFullList({
        filter: `user="${memberId}" && date_heure_debut >= "${now}"`,
        sort: 'date_heure_debut',
        expand: 'court',
      });

    // 4. Notes du moniteur sur cet élève (toutes)
    let notes: any[] = [];
    try {
      notes = await pb.collection('student_notes')
        .getFullList({
          filter: `student="${memberId}"`,
          sort: '-created',
          expand: 'moniteur',
        });
    } catch (e) {
      console.warn("Collection student_notes non trouvée");
    }

    // 5. Stats
    const totalHours = (pastReservations || []).reduce((acc, r) => {
      const diff = (new Date(r.date_heure_fin).getTime() - new Date(r.date_heure_debut).getTime()) / (1000 * 60 * 60);
      return acc + diff;
    }, 0);

    const coursCounts = (pastReservations || []).filter(r => r.type_reservation === 'entrainement').length;
    const libreCount = (pastReservations || []).filter(r => r.type_reservation === 'libre').length;

    return {
      id: profile.user,
      nom: profile.nom,
      prenom: profile.prenom,
      avatarUrl: profile.photo_url || profile.avatar_url,
      email: (profile as any).expand?.user?.email || '',
      role: profile.role,
      enrolledSince: profile.created,
      level: memberProfile?.niveau_tennis || 'NC',
      phone: memberProfile?.telephone || profile.telephone || null,
      statutAdhesion: memberProfile?.statut_adhesion || 'actif',
      typeAbonnement: memberProfile?.type_abonnement || 'mensuel',
      pastReservations: (pastReservations || []).map((r: any) => ({
        id: r.id,
        date: r.date_heure_debut,
        endTime: r.date_heure_fin,
        type: r.type_reservation || 'libre',
        courseType: r.type_reservation === 'entrainement' ? 'groupe' : 'individuel',
        status: r.statut,
        notes: r.notes,
        courtName: r.expand?.court?.nom || 'Court',
        courtType: r.expand?.court?.type_surface || 'Terre Battue',
        moniteurName: null,
      })),
      upcomingReservations: (upcomingReservations || []).map((r: any) => ({
        id: r.id,
        date: r.date_heure_debut,
        endTime: r.date_heure_fin,
        type: r.type_reservation || 'libre',
        courseType: r.type_reservation === 'entrainement' ? 'groupe' : 'individuel',
        courtName: r.expand?.court?.nom || 'Court',
        courtType: r.expand?.court?.type_surface || 'Terre Battue',
      })),
      notes: (notes || []).map((n: any) => ({
        id: n.id,
        content: n.content,
        rating: n.rating || 0,
        createdAt: n.created,
        moniteurName: n.expand?.moniteur ? `${n.expand.moniteur.prenom || ''} ${n.expand.moniteur.nom || ''}` : 'Moniteur',
      })),
      stats: {
        totalReservations: (pastReservations || []).length,
        totalHours: Math.round(totalHours * 10) / 10,
        totalCours: coursCounts,
        totalLibre: libreCount,
        upcomingCount: (upcomingReservations || []).length,
        notesCount: (notes || []).length,
      },
    };
  } catch (err: any) {
    console.error('Erreur getAdminMemberProfile:', err);
    throw new Error(err.message || 'Erreur lors de la récupération du profil');
  }
}
