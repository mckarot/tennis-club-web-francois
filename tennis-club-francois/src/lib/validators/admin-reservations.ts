/**
 * Schémas de validation pour les réservations (Admin)
 * Zero-Trust: Validation stricte de toutes les entrées
 */

import { z } from 'zod';

/**
 * Statuts de réservation
 */
export const reservationStatusSchema = z.enum(['confirmee', 'en_attente', 'annulee']);

/**
 * Types de réservation
 */
export const reservationTypeSchema = z.enum(['membre', 'entrainement', 'tournoi', 'libre', 'maintenance']);

/**
 * Formulaire de création de réservation pour un utilisateur (Admin)
 */
export const createReservationForUserSchema = z
  .object({
    courtId: z.string().uuid('Court invalide'),
    userId: z.string().uuid('Utilisateur invalide'),
    startTime: z
      .string()
      .min(1, 'L\'heure de début est requise')
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), 'Date invalide'),
    endTime: z
      .string()
      .min(1, 'L\'heure de fin est requise')
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), 'Date invalide'),
    type: reservationTypeSchema.default('membre'),
    notes: z.string().max(500, 'Notes trop longues').optional().default(''),
  })
  .refine(
    (data) => data.endTime > data.startTime,
    {
      message: 'L\'heure de fin doit être après l\'heure de début',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => data.startTime > new Date(),
    {
      message: 'La réservation doit être dans le futur',
      path: ['startTime'],
    }
  );

export type CreateReservationForUserInput = z.infer<typeof createReservationForUserSchema>;

/**
 * Formulaire de blocage de court (Maintenance)
 */
export const blockCourtSchema = z
  .object({
    courtId: z.string().uuid('Court invalide'),
    startTime: z
      .string()
      .min(1, 'L\'heure de début est requise')
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), 'Date invalide'),
    endTime: z
      .string()
      .min(1, 'L\'heure de fin est requise')
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), 'Date invalide'),
    reason: z
      .string()
      .min(1, 'La raison est requise')
      .max(200, 'Raison trop longue'),
  })
  .refine(
    (data) => data.endTime > data.startTime,
    {
      message: 'L\'heure de fin doit être après l\'heure de début',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => data.startTime >= new Date(),
    {
      message: 'Le blocage doit être dans le futur ou maintenant',
      path: ['startTime'],
    }
  );

export type BlockCourtInput = z.infer<typeof blockCourtSchema>;

/**
 * Filtres pour la liste des réservations
 */
export const getAllReservationsFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  courtId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: reservationStatusSchema.optional(),
  type: reservationTypeSchema.optional(),
});

export type GetAllReservationsFilter = z.infer<typeof getAllReservationsFilterSchema>;

/**
 * Formulaire de modification de réservation (Admin)
 */
export const adminUpdateReservationSchema = z.object({
  id: z.string().uuid('ID de réservation invalide'),
  courtId: z.string().uuid('Court invalide').optional(),
  userId: z.string().uuid('Utilisateur invalide').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: reservationTypeSchema.optional(),
  status: reservationStatusSchema.optional(),
  notes: z.string().max(500).optional().nullable(),
});

export type AdminUpdateReservationInput = z.infer<typeof adminUpdateReservationSchema>;

/**
 * Formulaire d'annulation de réservation
 */
export const cancelReservationSchema = z.object({
  id: z.string().uuid('ID de réservation invalide'),
  reason: z.string().max(200).optional(),
});

export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
