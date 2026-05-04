/**
 * Server Actions pour le Planning des Courts
 * Tennis Club du François
 */

'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { revalidatePath } from 'next/cache';
import { type PlanningDayData, type Court, type Reservation } from '@/lib/types/planning';
import { startOfDay, endOfDay, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function getPlanningData(dateStr: string): Promise<PlanningDayData> {
  const pb = await createAdminClient();
  const date = parseISO(dateStr);
  
  const start = startOfDay(date).toISOString();
  const end = endOfDay(date).toISOString();

  try {
    // 1. Récupérer les courts
    const courtsData = await pb.collection('courts').getFullList({
      sort: 'nom',
    });

    // 2. Récupérer les réservations
    const resData = await pb.collection('reservations').getFullList({
      filter: `date_heure_debut >= "${start.replace('T', ' ')}" && date_heure_debut <= "${end.replace('T', ' ')}" && statut = "confirmee"`,
      expand: 'user',
    });

    // 3. Enrichir avec les profils pour avoir les noms
    const userIds = [...new Set(resData.map(r => r.user))];
    let profiles: any[] = [];
    
    if (userIds.length > 0) {
      profiles = await pb.collection('profiles').getFullList({
        filter: userIds.map(id => `user = "${id}"`).join(' || '),
      });
    }

    const mappedReservations: Reservation[] = resData.map(res => {
      const profile = profiles.find(p => p.user === res.user);
      // Extraire un ID numérique court si possible pour court_id
      // PocketBase ID est une string, mais le type Reservation attend un number
      // On utilise une astuce pour l'ID du court ou on le récupère du court lié
      const courtRecord = courtsData.find(c => c.id === res.court);
      const courtIdNumeric = courtRecord ? parseInt(courtRecord.nom.replace(/[^0-9]/g, '')) || 1 : 1;

      return {
        id: res.id,
        court: courtIdNumeric,
        user: res.user,
        start_time: res.date_heure_debut,
        end_time: res.date_heure_fin,
        status: 'confirmée',
        notes: res.notes,
        user_details: {
          nom: profile?.nom || '',
          prenom: profile?.prenom || '',
          email: (res as any).expand?.user?.email || '',
        }
      };
    });

    return {
      date: dateStr,
      courts: courtsData.map(c => ({
        id: parseInt(c.nom.replace(/[^0-9]/g, '')) || 1,
        nom: c.nom,
        type: (c.type_surface === 'terre_battue' ? 'Terre Battue' : 
               c.type_surface === 'synthétique' ? 'Gazon Synthétique' : 
               c.type_surface === 'dur' ? 'Résine Hard' : 'Terre Battue') as any
      })),
      reservations: mappedReservations,
    };
  } catch (err) {
    console.error("[Planning] Erreur PocketBase:", err);
    return {
       date: dateStr,
       courts: [],
       reservations: []
    };
  }
}

/**
 * Synchronise les 6 courts pour correspondre au design professionnel
 */
export async function syncCourtsDesign() {
  const pb = await createAdminClient();
  
  const designCourts = [
    { nom: 'Court 1', type: 'synthétique' },
    { nom: 'Court 2', type: 'terre_battue' },
    { nom: 'Court 3', type: 'dur' },
    { nom: 'Court 4', type: 'terre_battue' },
    { nom: 'Court 5', type: 'synthétique' },
    { nom: 'Court 6', type: 'dur' }, // Note: Padel mapping
  ];

  for (const court of designCourts) {
    try {
      const existing = await pb.collection('courts').getFirstListItem(`nom="${court.nom}"`);
      await pb.collection('courts').update(existing.id, {
        type_surface: court.type,
        statut: 'disponible'
      });
    } catch (e) {
      await pb.collection('courts').create({
        nom: court.nom,
        type_surface: court.type,
        statut: 'disponible',
        eclaire: true
      });
    }
  }

  revalidatePath('/dashboard/admin/planning');
}

/**
 * Crée une réservation depuis le planning (Action Admin)
 */
export async function reserveSlotAction(data: {
  courtId: number;
  startTime: string;
  endTime: string;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await createAdminClient();

    // Trouver le court par son numéro dans le nom
    const court = await pb.collection('courts').getFirstListItem(`nom ~ "${data.courtId}"`);
    
    await pb.collection('reservations').create({
      court: court.id,
      user: data.userId,
      date_heure_debut: data.startTime.replace('T', ' '),
      date_heure_fin: data.endTime.replace('T', ' '),
      statut: 'confirmee',
      type_reservation: 'membre',
      notes: 'Réservé par l\'administrateur'
    });

    revalidatePath('/dashboard/admin/planning');
    return { success: true };
  } catch (err: any) {
    console.error("[Planning] Erreur insertion:", err);
    return { success: false, error: err.message || "Erreur lors de la réservation." };
  }
}
