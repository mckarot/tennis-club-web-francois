'use client';

import { useActionState } from 'react';
import { registerAction, type AuthResult } from '@/app/(auth)/actions';
import { useState } from 'react';

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    async (prev: AuthResult, formData: FormData) => {
      // Ignorer l'état précédent et appeler directement l'action
      return registerAction(formData);
    },
    {
      success: false,
      error: '',
      code: 'INTERNAL_ERROR' as const,
      details: {},
    }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Helper pour extraire les erreurs par champ depuis state.details
  const getFieldError = (field: 'email' | 'password' | 'confirmPassword' | 'fullName'): string | undefined => {
    if (!state.success && 'details' in state && state.details) {
      return state.details[field]?.[0];
    }
    return undefined;
  };

  // Helper pour accéder aux propriétés d'erreur de manière sûre
  const errorMessage = !state.success ? state.error : '';
  const hasGlobalError = !state.success && errorMessage && state.code !== 'VALIDATION_ERROR';
  const fieldEmailError = getFieldError('email');
  const fieldPasswordError = getFieldError('password');
  const fieldConfirmPasswordError = getFieldError('confirmPassword');
  const fieldFullNameError = getFieldError('fullName');
  const hasFieldErrors = fieldEmailError || fieldPasswordError || fieldConfirmPasswordError || fieldFullNameError;

  return (
    <form action={formAction} className="space-y-5">
      {/* Nom complet */}
      <div className="space-y-2">
        <label
          className="block text-white font-label text-sm font-semibold ml-1"
          htmlFor="fullName"
        >
          Nom complet
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
            person
          </span>
          <input
            className={`w-full bg-white/10 border-none rounded-full py-4 pl-12 pr-6 text-white placeholder-outline-variant focus:ring-2 focus:ring-secondary-fixed transition-all outline-none font-body ${
              hasFieldErrors || hasGlobalError ? 'ring-2 ring-error' : ''
            }`}
            id="fullName"
            name="fullName"
            placeholder="Jean Dupont"
            type="text"
            aria-invalid={!!fieldFullNameError}
            aria-describedby={fieldFullNameError ? 'fullName-error' : undefined}
            disabled={isPending}
          />
        </div>
        {fieldFullNameError && (
          <p id="fullName-error" className="text-error text-xs font-medium ml-1">
            {fieldFullNameError}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          className="block text-white font-label text-sm font-semibold ml-1"
          htmlFor="email"
        >
          Email
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
            mail
          </span>
          <input
            className={`w-full bg-white/10 border-none rounded-full py-4 pl-12 pr-6 text-white placeholder-outline-variant focus:ring-2 focus:ring-secondary-fixed transition-all outline-none font-body ${
              hasFieldErrors || hasGlobalError ? 'ring-2 ring-error' : ''
            }`}
            id="email"
            name="email"
            placeholder="votre@email.com"
            type="email"
            aria-invalid={!!fieldEmailError}
            aria-describedby={fieldEmailError ? 'email-error' : undefined}
            disabled={isPending}
          />
        </div>
        {fieldEmailError && (
          <p id="email-error" className="text-error text-xs font-medium ml-1">
            {fieldEmailError}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <label
          className="block text-white font-label text-sm font-semibold ml-1"
          htmlFor="password"
        >
          Mot de passe
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
            lock
          </span>
          <input
            className={`w-full bg-white/10 border-none rounded-full py-4 pl-12 pr-12 text-white placeholder-outline-variant focus:ring-2 focus:ring-secondary-fixed transition-all outline-none font-body ${
              hasFieldErrors || hasGlobalError ? 'ring-2 ring-error' : ''
            }`}
            id="password"
            name="password"
            placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            aria-invalid={!!fieldPasswordError}
            aria-describedby={fieldPasswordError ? 'password-error' : undefined}
            disabled={isPending}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-white transition-colors"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {fieldPasswordError && (
          <p id="password-error" className="text-error text-xs font-medium ml-1">
            {fieldPasswordError}
          </p>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div className="space-y-2">
        <label
          className="block text-white font-label text-sm font-semibold ml-1"
          htmlFor="confirmPassword"
        >
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-xl">
            lock_reset
          </span>
          <input
            className={`w-full bg-white/10 border-none rounded-full py-4 pl-12 pr-12 text-white placeholder-outline-variant focus:ring-2 focus:ring-secondary-fixed transition-all outline-none font-body ${
              hasFieldErrors || hasGlobalError ? 'ring-2 ring-error' : ''
            }`}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            type={showConfirmPassword ? 'text' : 'password'}
            aria-invalid={!!fieldConfirmPasswordError}
            aria-describedby={fieldConfirmPasswordError ? 'confirmPassword-error' : undefined}
            disabled={isPending}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-white transition-colors"
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isPending}
            aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <span className="material-symbols-outlined text-xl">
              {showConfirmPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {fieldConfirmPasswordError && (
          <p id="confirmPassword-error" className="text-error text-xs font-medium ml-1">
            {fieldConfirmPasswordError}
          </p>
        )}
      </div>

      {/* Role (caché, défaut membre) */}
      <input type="hidden" name="role" value="membre" />

      {/* Global Error Message */}
      {hasGlobalError && (
        <div className="bg-error/20 border border-error/50 rounded-full p-3 text-center">
          <p className="text-error text-sm font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        className={`w-full bg-secondary hover:bg-on-secondary-container text-white font-headline font-bold py-4 rounded-full shadow-lg transform transition-all duration-300 ${
          isPending ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
        }`}
        type="submit"
        disabled={isPending}
        aria-disabled={isPending}
      >
        {isPending ? 'Inscription...' : "S'inscrire"}
      </button>
    </form>
  );
}
