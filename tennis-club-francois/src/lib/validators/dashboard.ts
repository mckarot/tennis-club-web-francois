/**
 * Schémas de validation pour le Dashboard Admin
 * Zero-Trust: Validation stricte de toutes les entrées
 */

import { z } from 'zod';

/**
 * Statuts de réservation
 */
export const reservationStatusSchema = z.enum(['confirmee', 'en_attente', 'annulee', 'terminee']);

/**
 * Types de surface de court
 */
export const courtTypeSchema = z.enum(['Terre battue', 'Dur', 'Synthétique']);

/**
 * Filtres pour les réservations
 */
export const reservationsFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  court: z.coerce.number().optional(),
  status: z.string().optional(),
});

export type ReservationsFilter = z.infer<typeof reservationsFilterSchema>;

/**
 * Filtres pour la liste des membres
 */
export const membersFilterSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'moniteur', 'membre']).optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

export type MembersFilter = z.infer<typeof membersFilterSchema>;

/**
 * Formulaire de création de réservation pour un utilisateur (Admin)
 */
export const createReservationForUserSchema = z.object({
  court: z.coerce.number(),
  user: z.string().uuid('Utilisateur invalide'),
  date_heure_debut: z.string().min(1, 'L\'heure de début est requise'),
  date_heure_fin: z.string().min(1, 'L\'heure de fin est requise'),
  status: reservationStatusSchema.default('confirmee'),
  notes: z.string().max(500, 'Notes trop longues').optional().default(''),
});

export type CreateReservationForUserInput = z.infer<typeof createReservationForUserSchema>;

/**
 * Formulaire de blocage de court (Maintenance/Indisponibilité)
 */
export const blockCourtSchema = z.object({
  court: z.coerce.number(),
  date_heure_debut: z.string().min(1, 'L\'heure de début est requise'),
  date_heure_fin: z.string().min(1, 'L\'heure de fin est requise'),
  reason: z.string().min(1, 'La raison est requise').max(200, 'Raison trop longue'),
});

export type BlockCourtInput = z.infer<typeof blockCourtSchema>;
