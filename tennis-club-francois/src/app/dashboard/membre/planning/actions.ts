'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/lib/types/actions';

/**
 * Zod Schemas for Validation - Strict Mode
 */
const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const ReservationSchema = z.object({
  courtId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(200).optional(),
});

/**
 * Types
 */
export type WeeklyPlanningData = {
  courts: {
    id: string;
    nom: string;
    type: string;
    isOccupied: boolean;
    isInMaintenance: boolean;
  }[];
  reservations: {
    id: string;
    courtId: string;
    userId: string;
    startTime: string;
    endTime: string;
    userName?: string;
  }[];
  currentUserId: string;
};

/**
 * Fetch weekly planning data with PocketBase
 */
export async function getWeeklyPlanningData(startDate: string, endDate: string): Promise<ActionResult<WeeklyPlanningData>> {
  const pb = await createClient();
  
  // 1. Auth Guard (Zero-Trust)
  const user = pb.authStore.model;
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };
  }

  // 2. Input Validation
  const validation = DateRangeSchema.safeParse({ startDate, endDate });
  if (!validation.success) {
    return { success: false, error: 'Paramètres invalides', code: 'BAD_REQUEST' };
  }

  try {
    const adminPb = await createAdminClient();

    // 3. Fetch Courts
    const allCourts = await adminPb.collection('courts').getFullList({
      sort: 'nom',
    });

    // 4. Fetch Reservations with expand
    // Filter by date range. Use string comparison for dates in PocketBase.
    const allReservations = await adminPb.collection('reservations').getFullList({
      filter: `date_heure_debut >= "${startDate}" && date_heure_debut <= "${endDate}"`,
      expand: 'user,court',
      sort: 'date_heure_debut',
    });

    // 5. Build response data with Privacy protection (RGPD)
    const formattedReservations = allReservations.map(r => {
      const isOwner = r.user === user.id;
      
      // Get user name from expand. In our setup, reservations.user relates to users, 
      // but the expand might have been set to return profiles if there's a relation.
      // Based on the instruction, expand: 'user' should give us name info.
      const expandedProfile = r.expand?.user;
      let displayName = 'Réservé';
      
      if (isOwner) {
        if (expandedProfile) {
          const prenom = expandedProfile.prenom || '';
          const nom = expandedProfile.nom || '';
          displayName = prenom && nom ? `${prenom[0]}. ${nom}` : 'Ma Réservation';
        } else {
          displayName = 'Ma Réservation';
        }
      }

      return {
        id: r.id,
        courtId: r.court,
        userId: r.user,
        startTime: new Date(r.date_heure_debut).toISOString(),
        endTime: new Date(r.date_heure_fin).toISOString(),
        userName: displayName,
      };
    });

    // Determiner état occupé pour la sidebar (maintenant)
    const now = new Date().toISOString();
    const occupiedIds = new Set(
        allReservations
            .filter(r => r.date_heure_debut <= now && r.date_heure_fin >= now)
            .map(r => r.court)
    );

    const formattedCourts = allCourts.map(c => ({
      id: c.id,
      nom: c.nom,
      type: c.type_surface || 'Court',
      isOccupied: occupiedIds.has(c.id),
      isInMaintenance: c.statut === 'maintenance',
    }));

    return {
      success: true,
      data: {
        courts: formattedCourts,
        reservations: formattedReservations,
        currentUserId: user.id
      }
    };

  } catch (error) {
    console.error('[Planning Action] PocketBase error:', error);
    return { success: false, error: 'Erreur technique lors de la récupération du planning', code: 'INTERNAL_ERROR' };
  }
}

/**
 * Create a new reservation with double booking protection
 */
export async function createReservationAction(data: {
  courtId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<ActionResult<any>> {
  const pb = await createClient();
  
  // 1. Auth Guard
  const user = pb.authStore.model;
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };
  }

  // 2. Input Validation
  const validation = ReservationSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Données de réservation invalides', code: 'BAD_REQUEST' };
  }

  const { courtId, startTime, endTime, notes } = validation.data;

  try {
    const adminPb = await createAdminClient();

    // 3. Double Booking Check
    const existing = await adminPb.collection('reservations').getList(1, 1, {
      filter: `court = "${courtId}" && date_heure_debut = "${startTime}" && statut = "confirmee"`,
    });

    if (existing.totalItems > 0) {
      return { success: false, error: 'Ce créneau est déjà réservé.', code: 'CONFLICT' };
    }

    // 4. Insert
    await adminPb.collection('reservations').create({
      court: courtId,
      user: user.id,
      date_heure_debut: startTime,
      date_heure_fin: endTime,
      statut: 'confirmee',
      type_reservation: 'membre',
      notes: notes || 'Réservation planning',
    });

    revalidatePath('/dashboard/membre/planning');
    
    return { success: true, data: { status: 'confirmee' } };

  } catch (error) {
    console.error('[Reservation Action] error:', error);
    return { success: false, error: 'Impossible de créer la réservation.', code: 'INTERNAL_ERROR' };
  }
}
