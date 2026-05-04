'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';

export async function getMoniteurDashboardData() {
  const pb = await createClient();
  const user = pb.authStore.model;

  if (!user) {
    throw new Error('Non authentifié');
  }

  const userId = user.id;
  const pbAdmin = await createAdminClient();

  // 1. Récupérer le profil du moniteur
  let profile;
  try {
    profile = await pbAdmin.collection('profiles').getFirstListItem(`user="${userId}"`);
  } catch (error) {
    profile = null;
  }

  // 2. Récupérer les réservations pour les stats et élèves
  let allReservations: any[] = [];
  try {
    allReservations = await pbAdmin.collection('reservations').getFullList({
      filter: `moniteur="${userId}"`,
      sort: '-date_heure_debut',
      expand: 'user,court'
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
  }

  // 3. Récupérer les profils pour tous les élèves uniques
  const uniqueStudentIds = Array.from(new Set(allReservations.map(r => r.user).filter(Boolean))) as string[];
  let studentProfiles: any[] = [];
  try {
    if (uniqueStudentIds.length > 0) {
      const filter = uniqueStudentIds.map(id => `user="${id}"`).join(' || ');
      studentProfiles = await pbAdmin.collection('profiles').getFullList({
        filter: filter
      });
    }
  } catch (error) {
    console.error('Error fetching student profiles:', error);
  }

  const profileMap = new Map(studentProfiles.map(p => [p.user, p]));

  // 4. Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessionsToday = allReservations.filter(r => {
    const start = new Date(r.date_heure_debut);
    return start >= today && start < tomorrow;
  }).sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime());

  // Élèves Actifs (uniques dans toutes les réservations)
  const activeStudentsCount = uniqueStudentIds.length;

  // Heures cette semaine
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuster au Lundi
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weeklyReservations = allReservations.filter(r => new Date(r.date_heure_debut) >= startOfWeek);
  let totalMinutes = 0;
  weeklyReservations.forEach(r => {
    if (r.date_heure_debut && r.date_heure_fin) {
      const start = new Date(r.date_heure_debut);
      const end = new Date(r.date_heure_fin);
      totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
    }
  });
  const hoursThisWeek = Math.round(totalMinutes / 60);

  // 5. Derniers élèves (4 uniques)
  const recentStudentsMap = new Map();
  for (const r of allReservations) {
    const studentId = r.user;
    const profile = profileMap.get(studentId);
    const authUser = r.expand?.user;

    if (studentId && !recentStudentsMap.has(studentId)) {
      const name = profile ? `${profile.prenom || ''} ${profile.nom || ''}`.trim() : (r.student_name_manual || 'Élève');
      recentStudentsMap.set(studentId, {
        name: name || 'Élève',
        lastSession: new Date(r.date_heure_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        initials: profile ? `${profile.prenom?.[0] || ''}${profile.nom?.[0] || ''}`.toUpperCase() : '??',
        img: profile?.avatar_url ? `${process.env.NEXT_PUBLIC_PB_URL}/api/files/${profile.collectionId}/${profile.id}/${profile.avatar_url}` : null,
      });
      if (recentStudentsMap.size >= 4) break;
    }
  }

  // 6. Récupérer l'état des courts
  let allCourts: any[] = [];
  try {
    allCourts = await pbAdmin.collection('courts').getFullList({
      sort: 'nom'
    });
  } catch (error) {
    allCourts = [];
  }

  const mappedSessions = sessionsToday.map(s => {
    const profile = profileMap.get(s.user);
    const start = new Date(s.date_heure_debut);
    const end = new Date(s.date_heure_fin);
    const durationMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    return {
      id: s.id,
      time: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      duration: `${durationMin} min`,
      student: profile ? `${profile.prenom} ${profile.nom}` : (s.student_name_manual || 'Élève'),
      court: s.expand?.court?.nom || 'Court',
      type: s.type_reservation === 'cours' ? 'Individuel' : 'Libre',
      status: s.statut || s.status,
    };
  });

  return {
    profile: {
      fullName: `${profile?.prenom || ''} ${profile?.nom || ''}`.trim() || 'Coach',
      avatarUrl: profile?.avatar_url,
    },
    stats: {
      sessionsToday: sessionsToday.length,
      activeStudents: activeStudentsCount,
      hoursThisWeek: hoursThisWeek,
      nextSessionTime: mappedSessions[0]?.time || '--:--',
    },
    sessions: mappedSessions,
    recentStudents: Array.from(recentStudentsMap.values()),
    courts: allCourts.map(c => ({
      id: c.id,
      name: c.nom,
      status: c.statut === 'disponible' || c.status === 'disponible' ? 'disponible' : 'occupé',
      type: c.type,
    })),
  };
}
