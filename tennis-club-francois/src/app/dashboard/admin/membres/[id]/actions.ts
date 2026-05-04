'use server';

import { createClient } from '@/lib/pocketbase/server';

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
