'use server';

import { createClient } from '@/lib/pocketbase/server';

export async function getStudentProfile(studentId: string) {
  const pb = await createClient();
  const user = pb.authStore.model;

  if (!user) throw new Error('Non authentifié');

  // 1. Infos de base du profil
  let profile;
  try {
    profile = await pb.collection('profiles').getFirstListItem(`user="${studentId}"`, {
      expand: 'user'
    });
  } catch (error) {
    throw new Error('Élève introuvable');
  }

  const memberProfile = await pb.collection('member_profiles').getFirstListItem(`user="${studentId}"`).catch(() => null);

  // 2. Historique des cours avec CE moniteur (passés)
  let pastCourses;
  try {
    pastCourses = await pb.collection('reservations').getList(1, 20, {
      filter: `user="${studentId}" && moniteur="${user.id}" && date_heure_debut < "${new Date().toISOString()}"`,
      sort: '-date_heure_debut',
      expand: 'court'
    });
  } catch (error) {
    pastCourses = { items: [] };
  }

  // 3. Cours à venir avec CE moniteur
  let upcomingCourses;
  try {
    upcomingCourses = await pb.collection('reservations').getList(1, 5, {
      filter: `user="${studentId}" && moniteur="${user.id}" && date_heure_debut >= "${new Date().toISOString()}"`,
      sort: 'date_heure_debut',
      expand: 'court'
    });
  } catch (error) {
    upcomingCourses = { items: [] };
  }

  // 4. Notes du bloc-notes pour cet élève
  let notes: any[] = [];
  try {
    notes = await pb.collection('student_notes').getFullList({
      filter: `moniteur="${user.id}" && student="${studentId}"`,
      sort: '-created'
    });
  } catch (error) {
    notes = [];
  }

  // 5. Calcul des stats
  const pastCoursesItems = pastCourses.items || [];
  const totalHours = pastCoursesItems.reduce((acc: number, c: any) => {
    const diff = (new Date(c.date_heure_fin).getTime() - new Date(c.date_heure_debut).getTime()) / (1000 * 60 * 60);
    return acc + diff;
  }, 0);

  return {
    id: profile.user,
    nom: profile.nom,
    prenom: profile.prenom,
    avatarUrl: profile.avatar_url,
    email: profile.expand?.user?.email || '',
    enrolledSince: profile.created,
    level: memberProfile?.niveau_tennis || 'NC',
    phone: memberProfile?.telephone || null,
    statutAdhesion: memberProfile?.statut_adhesion || 'actif',
    typeAbonnement: memberProfile?.type_abonnement || 'mensuel',
    pastCourses: pastCoursesItems.map((c: any) => ({
      id: c.id,
      date: c.date_heure_debut,
      endTime: c.date_heure_fin,
      courseType: c.course_type || 'individuel',
      level: c.student_level,
      notes: c.notes,
      courtName: c.expand?.court?.nom || 'Court',
    })),
    upcomingCourses: (upcomingCourses.items || []).map((c: any) => ({
      id: c.id,
      date: c.date_heure_debut,
      endTime: c.date_heure_fin,
      courseType: c.course_type || 'individuel',
      courtName: c.expand?.court?.nom || 'Court',
    })),
    notes: notes.map((n: any) => ({
      id: n.id,
      content: n.content,
      rating: n.rating || 0,
      createdAt: n.created,
    })),
    stats: {
      totalCourses: pastCoursesItems.length,
      totalHours: Math.round(totalHours * 10) / 10,
      upcomingCount: (upcomingCourses.items || []).length,
      lastNote: notes[0]?.content || null,
    },
  };
}
