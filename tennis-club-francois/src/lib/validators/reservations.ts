/**
 * Schémas de validation pour les réservations
 */

import { z } from 'zod';

/**
 * Statuts de réservation
 */
export const reservationStatusSchema = z.enum(['confirmee', 'en_attente', 'annulee']);

/**
 * Types de réservation
 */
export const reservationTypeSchema = z.enum(['membre', 'entrainement', 'tournoi', 'libre']);

/**
 * Formulaire de création de réservation
 */
export const createReservationSchema = z
  .object({
    courtId: z.string().uuid('Court invalide'),
    startTime: z.string().min(1, 'L\'heure de début est requise'),
    endTime: z.string().min(1, 'L\'heure de fin est requise'),
    type: reservationTypeSchema.optional().default('membre'),
    notes: z.string().max(500, 'Notes trop longues').optional().default(''),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: 'L\'heure de fin doit être après l\'heure de début',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      return start > new Date();
    },
    {
      message: 'La réservation doit être dans le futur',
      path: ['startTime'],
    }
  );

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

/**
 * Formulaire de modification de réservation
 */
export const updateReservationSchema = z.object({
  id: z.string().uuid('ID de réservation invalide'),
  courtId: z.string().uuid('Court invalide').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: reservationTypeSchema.optional(),
  status: reservationStatusSchema.optional(),
  notes: z.string().max(500).optional().nullable(),
});

export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;

/**
 * Formulaire d'annulation de réservation
 */
export const cancelReservationSchema = z.object({
  id: z.string().uuid('ID de réservation invalide'),
});

export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;

/**
 * Filtres pour la liste des réservations
 */
export const reservationsFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  courtId: z.string().uuid().optional(),
  status: reservationStatusSchema.optional(),
  type: reservationTypeSchema.optional(),
});

export type ReservationsFilter = z.infer<typeof reservationsFilterSchema>;
