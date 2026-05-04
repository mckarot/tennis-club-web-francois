'use client';

/**
 * AddMemberModal - Modale d'ajout d'un membre
 * Dashboard Admin - Actions Rapides
 * 
 * Design System Stitch :
 * - Overlay: fixed inset-0 bg-black/60 backdrop-blur-sm z-50
 * - Modale: glass-card rounded-2xl p-6 w-full max-w-md
 * - Inputs: bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white
 * - Labels: text-xs font-bold text-outline uppercase tracking-wider
 */

import { useEffect, useRef, useCallback } from 'react';
import { useActionState } from 'react';
import { addMemberAction } from '@/app/dashboard/actions';
import type { ActionResult } from '@/lib/types/actions';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddMemberState = ActionResult<{ user: { id: string; email: string } }> & {
  details?: Record<string, string[]>;
};

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    addMemberAction,
    { success: false, error: '', code: 'INTERNAL_ERROR' } as AddMemberState
  );

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Helper pour accéder à details de manière type-safe
  const getDetails = () => {
    if (!state.success && 'details' in state) {
      return state.details;
    }
    return undefined;
  };
  const details = getDetails();

  // Log de montage
  useEffect(() => {
    console.log('[AddMemberModal] Montage de AddMemberModal.');
    return () => {
      console.log('[AddMemberModal] Démontage de AddMemberModal.');
    };
  }, []);

  // Log d'ouverture
  useEffect(() => {
    if (isOpen) {
      console.log('[AddMemberModal] AddMemberModal ouvert.');
    }
  }, [isOpen]);

  // Log du résultat de l'action
  useEffect(() => {
    console.info('[AddMemberModal] Résultat addMemberAction:', state);
  }, [state]);

  // Fermeture auto après succès (2s) + reset du formulaire
  useEffect(() => {
    if (state.success) {
      console.log('[AddMemberModal] Succès détecté, fermeture auto dans 2s...');
      const timer = setTimeout(() => {
        formRef.current?.reset();  // Reset du formulaire
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, onClose]);

  // Focus trap et gestion Echap
  useEffect(() => {
    if (!isOpen) return;

    // Focus sur le bouton de fermeture
    closeButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('[AddMemberModal] Touche Echap détectée, fermeture.');
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        // Focus trap basique
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Gestion du clic en dehors
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      console.log('[AddMemberModal] Clic en dehors détecté, fermeture.');
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-modal-title"
    >
      <div 
        ref={modalRef}
        className="glass-card rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
      >
        {/* Bouton de fermeture */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          aria-label="Fermer la modale"
          type="button"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* En-tête */}
        <div className="mb-6 pr-12">
          <h2 
            id="add-member-modal-title"
            className="text-2xl font-bold text-white font-headline"
          >
            Ajouter un Membre
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Créez un nouveau compte membre
          </p>
        </div>

        {/* Formulaire */}
        <form action={formAction} className="space-y-4">
          {/* Email */}
          <div>
            <label 
              htmlFor="add-member-email"
              className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
            >
              Email *
            </label>
            <input
              id="add-member-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="membre @exemple.com"
              aria-invalid={details?.email ? 'true' : 'false'}
              aria-describedby={details?.email ? 'add-member-email-error' : undefined}
              className={`w-full bg-white/10 border ${
                details?.email ? 'border-red-500' : 'border-white/20'
              } rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all`}
            />
            {details?.email && (
              <p id="add-member-email-error" className="text-red-400 text-xs mt-1" role="alert">
                {details.email[0]}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label 
              htmlFor="add-member-password"
              className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
            >
              Mot de passe *
            </label>
            <input
              id="add-member-password"
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={details?.password ? 'true' : 'false'}
              aria-describedby={details?.password ? 'add-member-password-error' : undefined}
              className={`w-full bg-white/10 border ${
                details?.password ? 'border-red-500' : 'border-white/20'
              } rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all`}
            />
            {details?.password && (
              <p id="add-member-password-error" className="text-red-400 text-xs mt-1" role="alert">
                {details.password[0]}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label 
                htmlFor="add-member-nom"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Nom *
              </label>
              <input
                id="add-member-nom"
                type="text"
                name="nom"
                required
                autoComplete="family-name"
                placeholder="Dupont"
                aria-invalid={details?.nom ? 'true' : 'false'}
                aria-describedby={details?.nom ? 'add-member-nom-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.nom ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all`}
              />
              {details?.nom && (
                <p id="add-member-nom-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.nom[0]}
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="add-member-prenom"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Prénom *
              </label>
              <input
                id="add-member-prenom"
                type="text"
                name="prenom"
                required
                autoComplete="given-name"
                placeholder="Jean"
                aria-invalid={details?.prenom ? 'true' : 'false'}
                aria-describedby={details?.prenom ? 'add-member-prenom-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.prenom ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all`}
              />
              {details?.prenom && (
                <p id="add-member-prenom-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.prenom[0]}
                </p>
              )}
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label 
              htmlFor="add-member-telephone"
              className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
            >
              Téléphone
              <span className="text-white/40 font-normal ml-1">(optionnel)</span>
            </label>
            <input
              id="add-member-telephone"
              type="tel"
              name="telephone"
              defaultValue=""
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              aria-invalid={details?.telephone ? 'true' : 'false'}
              aria-describedby={details?.telephone ? 'add-member-telephone-error' : undefined}
              className={`w-full bg-white/10 border ${
                details?.telephone ? 'border-red-500' : 'border-white/20'
              } rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all`}
            />
            {details?.telephone && (
              <p id="add-member-telephone-error" className="text-red-400 text-xs mt-1" role="alert">
                {details.telephone[0]}
              </p>
            )}
          </div>

          {/* Niveau de tennis */}
          <div>
            <label 
              htmlFor="add-member-niveau"
              className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
            >
              Niveau de tennis
              <span className="text-white/40 font-normal ml-1">(optionnel)</span>
            </label>
            <select
              id="add-member-niveau"
              name="niveau_tennis"
              defaultValue=""
              aria-invalid={details?.niveau_tennis ? 'true' : 'false'}
              aria-describedby={details?.niveau_tennis ? 'add-member-niveau-error' : undefined}
              className={`w-full bg-white/10 border ${
                details?.niveau_tennis ? 'border-red-500' : 'border-white/20'
              } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all appearance-none cursor-pointer`}
            >
              <option value="" className="bg-surface">Sélectionner un niveau</option>
              <option value="débutant" className="bg-surface">Débutant</option>
              <option value="intermédiaire" className="bg-surface">Intermédiaire</option>
              <option value="avancé" className="bg-surface">Avancé</option>
              <option value="expert" className="bg-surface">Expert</option>
            </select>
            {details?.niveau_tennis && (
              <p id="add-member-niveau-error" className="text-red-400 text-xs mt-1" role="alert">
                {details.niveau_tennis[0]}
              </p>
            )}
          </div>

          {/* Bouton de submission */}
          <button
            type="submit"
            disabled={isPending}
            aria-disabled={isPending}
            className={`w-full bg-secondary hover:bg-secondary-fixed text-white font-semibold rounded-full px-6 py-3 transition-all flex items-center justify-center gap-2 ${
              isPending ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Création en cours...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">person_add</span>
                Ajouter le membre
              </>
            )}
          </button>
        </form>

        {/* Messages d'état */}
        {!state.success && state.error && (
          <div 
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2"
            role="alert"
          >
            <span className="material-symbols-outlined text-red-400">error</span>
            <p className="text-red-400 text-sm">{state.error}</p>
          </div>
        )}

        {state.success && (
          <div 
            className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2"
            role="status"
          >
            <span className="material-symbols-outlined text-green-400">check_circle</span>
            <p className="text-green-400 text-sm">{state.message || 'Membre créé avec succès !'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
