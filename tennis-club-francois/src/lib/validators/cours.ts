/**
 * Schémas de validation pour les cours (Moniteur)
 * Zero-Trust: Validation stricte de toutes les entrées
 */

import { z } from 'zod';

/**
 * Types de cours
 */
export const typeCoursSchema = z.enum(['individuel', 'groupe', 'clinique', 'stage', 'competition']);

/**
 * Niveaux requis pour les cours
 */
export const niveauRequisSchema = z.enum(['tous', 'débutant', 'intermédiaire', 'avancé', 'expert']);

/**
 * Statuts des cours
 */
export const coursStatusSchema = z.enum(['prévu', 'en_cours', 'terminé', 'annulé']);

/**
 * Formulaire de création d'un cours (Moniteur)
 */
export const createCoursSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Le titre est requis')
      .max(100, 'Titre trop long'),
    description: z
      .string()
      .max(500, 'Description trop longue')
      .optional()
      .default(''),
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
    typeCours: typeCoursSchema.default('individuel'),
    niveauRequis: niveauRequisSchema.default('tous'),
    capaciteMax: z.number().int().positive().max(50).default(1),
    tarif: z.number().positive().optional(),
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
      message: 'Le cours doit être dans le futur',
      path: ['startTime'],
    }
  );

export type CreateCoursInput = z.infer<typeof createCoursSchema>;

/**
 * Formulaire de modification d'un cours (Moniteur)
 */
export const updateCoursSchema = z.object({
  id: z.string().uuid('ID de cours invalide'),
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Titre trop long')
    .optional(),
  description: z
    .string()
    .max(500, 'Description trop longue')
    .optional()
    .nullable(),
  courtId: z.string().uuid('Court invalide').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  typeCours: typeCoursSchema.optional(),
  niveauRequis: niveauRequisSchema.optional(),
  capaciteMax: z.number().int().positive().max(50).optional(),
  tarif: z.number().positive().optional().nullable(),
});

export type UpdateCoursInput = z.infer<typeof updateCoursSchema>;

/**
 * Formulaire d'annulation d'un cours
 */
export const cancelCoursSchema = z.object({
  id: z.string().uuid('ID de cours invalide'),
  reason: z
    .string()
    .min(1, 'La raison est requise')
    .max(200, 'Raison trop longue')
    .optional(),
  notifyStudents: z.boolean().default(true),
});

export type CancelCoursInput = z.infer<typeof cancelCoursSchema>;

/**
 * Formulaire d'inscription à un cours (Membre)
 */
export const registerForCoursSchema = z.object({
  coursId: z.string().uuid('ID de cours invalide'),
  notes: z.string().max(200).optional().default(''),
});

export type RegisterForCoursInput = z.infer<typeof registerForCoursSchema>;

/**
 * Formulaire d'annulation d'inscription à un cours
 */
export const cancelCoursInscriptionSchema = z.object({
  inscriptionId: z.string().uuid('ID d\'inscription invalide'),
});

export type CancelCoursInscriptionInput = z.infer<typeof cancelCoursInscriptionSchema>;

/**
 * Filtres pour la recherche de cours
 */
export const coursFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  typeCours: typeCoursSchema.optional(),
  niveauRequis: niveauRequisSchema.optional(),
  moniteurId: z.string().uuid().optional(),
  courtId: z.string().uuid().optional(),
});

export type CoursFilter = z.infer<typeof coursFilterSchema>;
