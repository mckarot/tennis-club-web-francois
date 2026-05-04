'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';

export async function getMoniteurPlanningData(mondayDateStr?: string) {
  const pb = await createClient();
  const user = pb.authStore.model;

  if (!user) {
    throw new Error('Non authentifié');
  }

  const userId = user.id;
  const adminPb = await createAdminClient();

  // 1. Déterminer la période (Lundi à Dimanche)
  // Parse the monday string directly to avoid timezone shift
  const mondayStr = getMondayStr(mondayDateStr);
  const [sy, sm, sd] = mondayStr.split('-').map(Number);
  const startOfWeek = new Date(sy, sm - 1, sd); // local midnight, no UTC shift
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  // 2. Récupérer TOUTES les réservations pour la semaine (pour voir l'occupation globale)
  let weekReservations: any[] = [];
  try {
    weekReservations = await adminPb.collection('reservations').getFullList({
      filter: `date_heure_debut >= "${startOfWeek.toISOString()}" && date_heure_debut < "${endOfWeek.toISOString()}"`,
      sort: 'date_heure_debut',
      expand: 'court,user,moniteur'
    });
  } catch (error) {
    console.error('Planning Error:', error);
    weekReservations = [];
  }

  const formattedReservations = (weekReservations || []).map(res => {
    const isMine = res.moniteur === userId;
    const courtInfo = res.expand?.court;
    const userInfo = res.expand?.user;
    const moniteurInfo = res.expand?.moniteur;

    return {
      id: res.id,
      start_time: res.date_heure_debut,
      end_time: res.date_heure_fin,
      type: res.type_reservation || 'libre',
      course_type: res.course_type,
      isMine,
      notes: res.notes,
      student_name_manual: res.student_name_manual,
      // Match PlanningClient expectations
      profiles: userInfo ? { prenom: userInfo.prenom, nom: userInfo.nom } : null,
      courts: courtInfo ? { nom: courtInfo.nom } : null,
      moniteurName: moniteurInfo ? `${moniteurInfo.prenom} ${moniteurInfo.nom}` : null,
    };
  });

  // 3. Récupérer les stats "Aujourd'hui" (uniquement pour CE moniteur)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  let todayReservations: any[] = [];
  try {
    todayReservations = await adminPb.collection('reservations').getFullList({
      filter: `moniteur="${userId}" && date_heure_debut >= "${todayStart.toISOString()}" && date_heure_debut < "${todayEnd.toISOString()}"`
    });
  } catch (error) {
    todayReservations = [];
  }

  let todayHours = 0;
  const uniqueStudents = new Set();

  todayReservations?.forEach(res => {
    const start = new Date(res.date_heure_debut);
    const end = new Date(res.date_heure_fin);
    todayHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (res.user) uniqueStudents.add(res.user);
  });

  // 4. Récupérer l'état des courts
  let allCourts: any[] = [];
  try {
    allCourts = await adminPb.collection('courts').getFullList({
      sort: 'nom'
    });
  } catch (error) {
    allCourts = [];
  }

  return {
    mondayStr,
    startOfWeek: startOfWeek.toISOString(),
    reservations: formattedReservations,
    stats: {
      todayHours: Math.round(todayHours),
      todayStudents: uniqueStudents.size,
    },
    courts: allCourts?.map(c => ({
      id: c.id,
      name: c.nom,
      status: c.statut === 'disponible' ? 'LIBRE' : 'OCCUPÉ',
    })) || [],
  };
}

export async function addCourse(formData: {
  courtId: string;
  startTime: string;
  endTime: string;
  courseType: 'individuel' | 'collectif' | 'stage';
  studentId?: string;
  studentNameManual?: string;
  studentLevel?: string;
  studentCount?: number;
  notes?: string;
}) {
  const pb = await createClient();
  const user = pb.authStore.model;
  if (!user || user.role !== 'moniteur') {
    throw new Error('Unauthorized');
  }
  
  const adminPb = await createAdminClient();
  const moniteurId = user.id;

  try {
    const data = await adminPb.collection('reservations').create({
      court: formData.courtId,
      date_heure_debut: formData.startTime,
      date_heure_fin: formData.endTime,
      type: 'cours',
      course_type: formData.courseType,
      user: formData.studentId || null,
      student_name_manual: formData.studentNameManual || null,
      student_level: formData.studentLevel || null,
      student_count: formData.studentCount || 1,
      moniteur: moniteurId,
      notes: formData.notes || null,
      statut: 'confirmee'
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Full PocketBase Error during insert:', error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
}

function getMondayStr(dateStr?: string): string {
  let year: number, month: number, day: number;
  
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    [year, month, day] = dateStr.split('-').map(Number);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
  }

  // Build local date to find the day of week (no UTC shift since we use local constructor)
  const d = new Date(year, month - 1, day);
  const dow = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = dow === 0 ? -6 : 1 - dow; // adjust to Monday
  d.setDate(d.getDate() + diff);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}
