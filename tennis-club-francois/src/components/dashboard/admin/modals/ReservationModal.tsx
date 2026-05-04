'use client';

/**
 * ReservationModal - Modale de création de réservation
 * Dashboard Admin - Actions Rapides
 * 
 * Design System Stitch :
 * - Overlay: fixed inset-0 bg-black/60 backdrop-blur-sm z-50
 * - Modale: glass-card rounded-2xl p-6 w-full max-w-md
 * - Inputs: bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white
 * - Labels: text-xs font-bold text-outline uppercase tracking-wider
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useActionState } from 'react';
import { createReservationForUserAction, getAllCourtsAction, getMembersAction } from '@/app/dashboard/actions';
import type { ActionResult } from '@/lib/types/actions';
import type { CourtWithOccupation, MemberWithProfile, ReservationWithDetails } from '@/lib/types/dashboard';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReservationState = ActionResult<{ reservation: ReservationWithDetails }> & {
  details?: Record<string, string[]>;
};

export function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const [state, formAction, isPending] = useActionState(
    createReservationForUserAction,
    { success: false, error: '', code: 'INTERNAL_ERROR' } as ReservationState
  );

  const [courts, setCourts] = useState<CourtWithOccupation[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
    console.log('[ReservationModal] Montage de ReservationModal.');
    return () => {
      console.log('[ReservationModal] Démontage de ReservationModal.');
    };
  }, []);

  // Log d'ouverture
  useEffect(() => {
    if (isOpen) {
      console.log('[ReservationModal] ReservationModal ouvert.');
    }
  }, [isOpen]);

  // Log du résultat de l'action
  useEffect(() => {
    console.info('[ReservationModal] Résultat createReservationForUserAction:', state);
  }, [state]);

  // Chargement des courts et membres au montage
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!isOpen) return;

      setIsLoadingData(true);
      console.log('[ReservationModal] Chargement des courts et membres...');

      try {
        const [courtsResult, membersResult] = await Promise.all([
          getAllCourtsAction(),
          getMembersAction({ limit: 100 }),
        ]);

        if (!mounted) return;

        if (courtsResult.success && courtsResult.data) {
          setCourts(courtsResult.data);
          console.log('[ReservationModal] Courts chargés:', courtsResult.data.length);
        } else if (!courtsResult.success) {
          console.error('[ReservationModal] Erreur chargement courts:', courtsResult.error);
        }

        if (membersResult.success && membersResult.data) {
          setMembers(membersResult.data.members);
          console.log('[ReservationModal] Membres chargés:', membersResult.data.members.length);
        } else if (!membersResult.success) {
          console.error('[ReservationModal] Erreur chargement membres:', membersResult.error);
        }
      } catch (error) {
        console.error('[ReservationModal] Erreur lors du chargement:', error);
      } finally {
        if (mounted) {
          setIsLoadingData(false);
        }
      }
    }

    if (isOpen) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Fermeture auto après succès (2s)
  useEffect(() => {
    if (state.success) {
      console.log('[ReservationModal] Succès détecté, fermeture auto dans 2s...');
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, onClose]);

  // Focus trap et gestion Echap
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('[ReservationModal] Touche Echap détectée, fermeture.');
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
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
      console.log('[ReservationModal] Clic en dehors détecté, fermeture.');
      onClose();
    }
  }, [onClose]);

  // Formater la date pour datetime-local (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Dates par défaut (maintenant + 1h)
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 3600000);
  const defaultStartTime = formatDateTimeLocal(now);
  const defaultEndTime = formatDateTimeLocal(oneHourLater);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
    >
      <div 
        ref={modalRef}
        className="glass-card rounded-2xl p-6 w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Bouton de fermeture */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          aria-label="Fermer la modale"
          type="button"
          disabled={isLoadingData}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* En-tête */}
        <div className="mb-6 pr-12">
          <h2 
            id="reservation-modal-title"
            className="text-2xl font-bold text-white font-headline"
          >
            Nouvelle Réservation
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Réservez un court pour un membre
          </p>
        </div>

        {/* État de chargement des données */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-secondary text-4xl">progress_activity</span>
            <p className="text-white/60 ml-3">Chargement des données...</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {/* Court */}
            <div>
              <label 
                htmlFor="reservation-court"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Court *
              </label>
              <select
                id="reservation-court"
                name="court"
                required
                aria-invalid={details?.court ? 'true' : 'false'}
                aria-describedby={details?.court ? 'reservation-court-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.court ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all appearance-none cursor-pointer`}
              >
                <option value="" className="bg-surface">Sélectionner un court</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id} className="bg-surface">
                    {court.nom} {!court.disponible && '(Occupé)'}
                  </option>
                ))}
              </select>
              {details?.court && (
                <p id="reservation-court-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.court[0]}
                </p>
              )}
            </div>

            {/* Membre */}
            <div>
              <label 
                htmlFor="reservation-member"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Membre *
              </label>
              <select
                id="reservation-member"
                name="user"
                required
                aria-invalid={details?.user ? 'true' : 'false'}
                aria-describedby={details?.user ? 'reservation-member-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.user ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all appearance-none cursor-pointer`}
              >
                <option value="" className="bg-surface">Sélectionner un membre</option>
                {members.map((member) => (
                  <option key={member.user} value={member.user} className="bg-surface">
                    {member.prenom} {member.nom} - {member.email}
                  </option>
                ))}
              </select>
              {details?.user && (
                <p id="reservation-member-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.user[0]}
                </p>
              )}
            </div>

            {/* Date et heure de début */}
            <div>
              <label 
                htmlFor="reservation-start"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Date et heure de début *
              </label>
              <input
                id="reservation-start"
                type="datetime-local"
                name="start_time"
                required
                defaultValue={defaultStartTime}
                aria-invalid={details?.start_time ? 'true' : 'false'}
                aria-describedby={details?.start_time ? 'reservation-start-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.start_time ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
              />
              {details?.start_time && (
                <p id="reservation-start-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.start_time[0]}
                </p>
              )}
            </div>

            {/* Date et heure de fin */}
            <div>
              <label 
                htmlFor="reservation-end"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Date et heure de fin *
              </label>
              <input
                id="reservation-end"
                type="datetime-local"
                name="end_time"
                required
                defaultValue={defaultEndTime}
                aria-invalid={details?.end_time ? 'true' : 'false'}
                aria-describedby={details?.end_time ? 'reservation-end-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.end_time ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
              />
              {details?.end_time && (
                <p id="reservation-end-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.end_time[0]}
                </p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label 
                htmlFor="reservation-status"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Statut *
              </label>
              <select
                id="reservation-status"
                name="status"
                defaultValue="confirmee"
                aria-invalid={details?.status ? 'true' : 'false'}
                aria-describedby={details?.status ? 'reservation-status-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.status ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all appearance-none cursor-pointer`}
              >
                <option value="confirmee" className="bg-surface">Confirmée</option>
                <option value="en_attente" className="bg-surface">En attente</option>
                <option value="annulée" className="bg-surface">Annulée</option>
              </select>
              {details?.status && (
                <p id="reservation-status-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.status[0]}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label 
                htmlFor="reservation-notes"
                className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2"
              >
                Notes
                <span className="text-white/40 font-normal ml-1">(optionnel)</span>
              </label>
              <textarea
                id="reservation-notes"
                name="notes"
                rows={3}
                placeholder="Informations complémentaires..."
                aria-invalid={details?.notes ? 'true' : 'false'}
                aria-describedby={details?.notes ? 'reservation-notes-error' : undefined}
                className={`w-full bg-white/10 border ${
                  details?.notes ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all resize-none`}
              />
              {details?.notes && (
                <p id="reservation-notes-error" className="text-red-400 text-xs mt-1" role="alert">
                  {details.notes[0]}
                </p>
              )}
            </div>

            {/* Bouton de submission */}
            <button
              type="submit"
              disabled={isPending || isLoadingData}
              aria-disabled={isPending || isLoadingData}
              className={`w-full bg-secondary hover:bg-secondary-fixed text-white font-semibold rounded-full px-6 py-3 transition-all flex items-center justify-center gap-2 ${
                isPending || isLoadingData ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Création en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">event_available</span>
                  Créer la réservation
                </>
              )}
            </button>
          </form>
        )}

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
            <p className="text-green-400 text-sm">{state.message || 'Réservation créée avec succès !'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
