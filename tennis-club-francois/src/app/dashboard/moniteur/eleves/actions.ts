'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';

export interface StudentData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  avatarUrl: string | null;
  enrolledSince: string;
  level: string | null;
  phone: string | null;
  lastLesson?: {
    date: Date;
    courtName: string;
  };
}

export async function getMoniteurStudentsData() {
  const pb = await createClient();
  const user = pb.authStore.model;

  if (!user) {
    throw new Error('Not authenticated');
  }

  const adminPb = await createAdminClient();

  // 1. Fetch all members with their profile and detailed info
  let members;
  try {
    members = await adminPb.collection('profiles').getFullList({
      filter: 'role="membre"',
      expand: 'user'
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return { students: [], totalActive: 0 };
  }

  // 2. For each member, find their last reservation with THIS moniteur
  const students: StudentData[] = await Promise.all(members.map(async (m: any) => {
    let lastRes;
    try {
      lastRes = await adminPb.collection('reservations').getFirstListItem(
        `user="${m.user}" && moniteur="${user.id}" && date_heure_debut < "${new Date().toISOString()}"`,
        {
          sort: '-date_heure_debut',
          expand: 'court,user'
        }
      );
    } catch (e) {
      lastRes = null;
    }

    const memberProfile = await adminPb.collection('member_profiles').getFirstListItem(`user="${m.user}"`).catch(() => null);

    return {
      id: m.user,
      nom: m.nom,
      prenom: m.prenom,
      email: m.expand?.user?.email || '',
      avatarUrl: m.avatar_url,
      enrolledSince: m.created,
      level: memberProfile?.niveau_tennis || 'NC',
      phone: memberProfile?.telephone || '',
      lastLesson: lastRes ? {
        date: new Date(lastRes.date_heure_debut),
        courtName: lastRes.expand?.court?.nom || 'Court'
      } : undefined
    };
  }));

  return {
    students,
    totalActive: students.length
  };
}
