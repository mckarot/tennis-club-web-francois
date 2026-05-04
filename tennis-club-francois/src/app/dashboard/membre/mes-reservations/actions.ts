'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/lib/types/actions';

/**
 * Types for UI
 */
export type UserReservation = {
  id: string;
  courtName: string;
  courtType: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
}

export type ReservationStats = {
  totalHours: number;
  upcomingCount: number;
}

export type MyReservationsData = {
  upcoming: UserReservation[];
  past: UserReservation[];
  stats: ReservationStats;
}

/**
 * Fetch all reservations for the logged-in user
 */
export async function getMyReservations(): Promise<ActionResult<MyReservationsData>> {
  const pb = await createClient();
  
  // 1. Auth Guard (Zero-Trust)
  const user = pb.authStore.model;
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };
  }

  try {
    const adminPb = await createAdminClient();
    const now = new Date();

    // 2. Fetch Reservations with Court details
    const all = await adminPb.collection('reservations').getFullList({
      filter: `user="${user.id}"`,
      expand: 'court',
      sort: '-date_heure_debut',
    });

    // 3. Process data
    const upcoming: UserReservation[] = [];
    const past: UserReservation[] = [];
    let totalMinutes = 0;

    all.forEach(r => {
      const startTime = new Date(r.date_heure_debut);
      const endTime = new Date(r.date_heure_fin);
      
      // Map status for UI compatibility (accents)
      let displayStatus = r.statut;
      if (displayStatus === 'confirmee') displayStatus = 'confirmée';
      if (displayStatus === 'annulee') displayStatus = 'annulée';
      if (displayStatus === 'effectuee') displayStatus = 'effectuée';

      // Map court type for UI compatibility
      let displayCourtType = 'Court';
      const rawType = r.expand?.court?.type_surface;
      if (rawType === 'terre_battue') displayCourtType = 'Terre Battue';
      else if (rawType === 'synthétique') displayCourtType = 'Gazon Synthétique';
      else if (rawType === 'dur') displayCourtType = 'Résine Hard';
      else if (rawType) displayCourtType = rawType;
      
      const res: UserReservation = {
        id: r.id,
        courtName: r.expand?.court?.nom || 'Inconnu',
        courtType: displayCourtType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: displayStatus,
        notes: r.notes,
      };

      if (startTime > now) {
        upcoming.push(res);
      } else {
        past.push(res);
        // Only count 'effectuee' or 'confirmee' for stats
        if (r.statut === 'effectuee' || r.statut === 'confirmee' || r.statut === 'effectuée' || r.statut === 'confirmée') {
          totalMinutes += (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        }
      }
    });

    return {
      success: true,
      data: {
        upcoming: upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
        past: past.slice(0, 3),
        stats: {
          totalHours: Math.round(totalMinutes / 60),
          upcomingCount: upcoming.length,
        }
      }
    };

  } catch (error) {
    console.error('[MyReservations Action] PocketBase error:', error);
    return { success: false, error: 'Erreur technique lors de la récupération de vos réservations', code: 'INTERNAL_ERROR' };
  }
}

/**
 * Cancel a reservation (Change status to 'annulee')
 */
export async function cancelReservationAction(reservationId: string): Promise<ActionResult<void>> {
  const pb = await createClient();
  
  // 1. Auth Guard
  const user = pb.authStore.model;
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' };
  }

  try {
    const adminPb = await createAdminClient();

    // 2. Verification (Zero-Trust: check ownership)
    const existing = await adminPb.collection('reservations').getOne(reservationId);

    if (!existing) {
      return { success: false, error: 'Réservation non trouvée', code: 'NOT_FOUND' };
    }

    if (existing.user !== user.id) {
      return { success: false, error: 'Action non autorisée', code: 'FORBIDDEN' };
    }

    // 3. Update status (using 'annulee' per seed)
    await adminPb.collection('reservations').update(reservationId, { statut: 'annulee' });

    revalidatePath('/dashboard/membre/mes-reservations');
    revalidatePath('/dashboard/membre/planning');
    
    return { success: true, data: undefined };

  } catch (error) {
    console.error('[Cancel Action] error:', error);
    return { success: false, error: 'Impossible d\'annuler la réservation.', code: 'INTERNAL_ERROR' };
  }
}
