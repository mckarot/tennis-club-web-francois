/**
 * Schémas de validation pour la gestion des membres
 * Zero-Trust: Tous les champs sont validés strictement
 */

import { z } from 'zod';

/**
 * Statuts d'adhésion possibles
 */
export const statutAdhesionSchema = z.enum(['actif', 'inactif', 'en_attente', 'suspendu']);

/**
 * Types d'abonnement disponibles
 */
export const typeAbonnementSchema = z.enum(['mensuel', 'annuel', 'premium', 'vip', 'occasionnel']);

/**
 * Niveaux de tennis
 */
export const niveauTennisSchema = z.enum(['débutant', 'intermédiaire', 'avancé', 'expert', 'compétition']);

/**
 * Formulaire de création d'un membre (Admin)
 * Inclut les données user + profile
 */
export const createMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Adresse email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  fullName: z
    .string()
    .min(1, 'Le nom complet est requis')
    .max(200, 'Le nom est trop long'),
  role: z.enum(['admin', 'moniteur', 'membre']).default('membre'),
  statutAdhesion: statutAdhesionSchema.default('en_attente'),
  typeAbonnement: typeAbonnementSchema.default('mensuel'),
  telephone: z
    .string()
    .min(1, 'Le téléphone est requis')
    .regex(/^\+?[0-9\s.-]+$/, 'Numéro de téléphone invalide')
    .optional(),
  niveau: niveauTennisSchema.default('débutant'),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

/**
 * Formulaire de modification d'un membre (Admin)
 * Tous les champs sont optionnels (modification partielle)
 */
export const updateMemberSchema = z.object({
  id: z.string().uuid('ID de membre invalide'),
  fullName: z
    .string()
    .min(1, 'Le nom complet est requis')
    .max(200, 'Le nom est trop long')
    .optional(),
  email: z
    .string()
    .email('Adresse email invalide')
    .optional(),
  telephone: z
    .string()
    .regex(/^\+?[0-9\s.-]+$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable(),
  niveau: niveauTennisSchema.optional(),
  statutAdhesion: statutAdhesionSchema.optional(),
  typeAbonnement: typeAbonnementSchema.optional(),
  avatarUrl: z
    .string()
    .url('URL d\'avatar invalide')
    .optional()
    .nullable(),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

/**
 * Formulaire de suppression d'un membre
 */
export const deleteMemberSchema = z.object({
  id: z.string().uuid('ID de membre invalide'),
  confirm: z.boolean().refine((val) => val === true, {
    message: 'La confirmation est requise',
  }),
});

export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>;

/**
 * Formulaire de changement de statut
 */
export const updateMemberStatusSchema = z.object({
  id: z.string().uuid('ID de membre invalide'),
  statutAdhesion: statutAdhesionSchema,
});

export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>;

/**
 * Filtres pour la liste des membres
 */
export const membersFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  statut: statutAdhesionSchema.optional(),
  typeAbonnement: typeAbonnementSchema.optional(),
  role: z.enum(['admin', 'moniteur', 'membre']).optional(),
});

export type MembersFilter = z.infer<typeof membersFilterSchema>;

/**
 * Formulaire d'ajout d'un membre par l'admin
 * Inclut email, password et infos de base
 */
export const addMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Adresse email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  nom: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom est trop long'),
  prenom: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom est trop long'),
  telephone: z
    .string()
    .regex(/^\+?[0-9\s.-]+$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  niveau_tennis: z
    .enum(['débutant', 'intermédiaire', 'avancé', 'expert'])
    .optional()
    .or(z.literal('')),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
