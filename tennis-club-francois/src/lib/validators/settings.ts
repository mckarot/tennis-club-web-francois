/**
 * Schémas de validation pour les paramètres (Settings)
 * Zero-Trust: Validation stricte de toutes les entrées
 */

import { z } from 'zod';

/**
 * Jours de la semaine
 */
export const dayOfWeekSchema = z.enum(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']);

/**
 * Formulaire de mise à jour des paramètres du club (Admin)
 */
export const clubSettingsSchema = z.object({
  clubName: z
    .string()
    .min(1, 'Le nom du club est requis')
    .max(100, 'Nom trop long'),
  description: z
    .string()
    .max(500, 'Description trop longue')
    .optional(),
  adresse: z
    .string()
    .max(200)
    .optional(),
  telephone: z
    .string()
    .regex(/^\+?[0-9\s.-]+$/, 'Numéro de téléphone invalide')
    .optional(),
  email: z
    .string()
    .email('Email invalide')
    .optional(),
  siteWeb: z
    .string()
    .url('URL invalide')
    .optional(),
  tarifStandard: z
    .number()
    .positive('Tarif doit être positif')
    .max(1000)
    .optional(),
  tarifPremium: z
    .number()
    .positive('Tarif doit être positif')
    .max(1000)
    .optional(),
  horairesOuverture: z
    .object({
      lundi: z.object({
        ouvert: z.boolean(),
        de: z.string().optional(),
        a: z.string().optional(),
      }),
      mardi: z.object({
        ouvert: z.boolean(),
        de: z.string().optional(),
        a: z.string().optional(),
      }),
      mercredi: z.object({
        ouvert: z.boolean(),
        de: z.string().optional(),
        a: z.string().optional(),
      }),
      jeudi: z.object({
        ouvert: z.boolean(),
        de: z.string().optional(),
        a: z.string().optional(),
      }),
      vendredi: z.object({
        ouvert: z.boolean(),
        de: z.string().optional(),
        a: z.string().optional(),
      }),
      samedi: z.object({
        ouvert: z.boolean(),
        de: z.string().optional(),
        a: z.string().optional(),
      }),
      dimanche: z.object({
        ouvert: z.boolean(),
        de: z.string().optional(),
        a: z.string().optional(),
      }),
    })
    .optional(),
});

export type ClubSettingsInput = z.infer<typeof clubSettingsSchema>;

/**
 * Formulaire de mise à jour du profil membre/moniteur
 */
export const profileSettingsSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Le nom complet est requis')
    .max(200, 'Nom trop long'),
  telephone: z
    .string()
    .regex(/^\+?[0-9\s.-]+$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'Bio trop longue')
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .url('URL d\'avatar invalide')
    .optional()
    .nullable(),
  niveau: z
    .enum(['débutant', 'intermédiaire', 'avancé', 'expert', 'competition'])
    .optional(),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;

/**
 * Formulaire de mise à jour des préférences de notification
 */
export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  newsletter: z.boolean().default(false),
  rappelReservation: z.boolean().default(true),
  annulationCours: z.boolean().default(true),
  promoEvenements: z.boolean().default(false),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

/**
 * Formulaire de changement de mot de passe
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Le mot de passe actuel est requis'),
    newPassword: z
      .string()
      .min(1, 'Le nouveau mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z
      .string()
      .min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Le nouveau mot de passe doit être différent de l\'actuel',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
