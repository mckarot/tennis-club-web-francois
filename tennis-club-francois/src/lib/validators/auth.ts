/**
 * Schémas de validation pour l'authentification
 * Basés sur les schémas globaux de lib/validators/schema.ts
 */

import { z } from 'zod';

/**
 * Formulaire de connexion
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Adresse email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Formulaire d'inscription
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'L\'email est requis')
      .email('Adresse email invalide'),
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'La confirmation est requise'),
    fullName: z
      .string()
      .min(1, 'Le nom est requis')
      .max(200, 'Le nom est trop long'),
    role: z.enum(['admin', 'moniteur', 'membre']).optional().default('membre'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Formulaire de mot de passe oublié
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Adresse email invalide'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Formulaire de réinitialisation de mot de passe
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Formulaire de modification de profil
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long').optional(),
  avatarUrl: z.string().url('URL d\'avatar invalide').optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
