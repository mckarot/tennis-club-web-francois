'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserReservation } from '@/app/dashboard/membre/mes-reservations/actions';

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  reservation: UserReservation;
}

export default function CancelConfirmationModal({ isOpen, onClose, onConfirm, reservation }: CancelConfirmationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError("Erreur technique lors de l'annulation.");
    } finally {
      setSubmitting(false);
    }
  };

  const startDate = parseISO(reservation.startTime);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#01261f]/80 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="bg-[#f9faf8] w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl relative z-10 animate-scale-in border border-white/20">
        
        {/* Header (Red warning style) */}
        <div className="bg-error-container p-8 text-on-error-container relative">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-headline font-black tracking-tighter mb-1 uppercase italic">Annuler la Réservation</h2>
              <p className="opacity-60 text-[10px] font-black uppercase tracking-widest leading-none">Action irréversible</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center hover:bg-error/20 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 animate-shake text-sm font-bold">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <p className="text-on-surface-variant text-sm font-medium mb-8 leading-relaxed">
            Êtes-vous sûr de vouloir annuler votre créneau ? Cette action libérera le court pour les autres membres.
          </p>

          {/* Reservation Summary Box */}
          <div className="bg-surface-container-low rounded-[2rem] p-6 mb-10 border border-outline-variant/10 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">sports_tennis</span>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-on-surface-variant/40 tracking-widest mb-0.5">Terrain</p>
                  <p className="font-headline font-black text-primary uppercase text-lg leading-none">{reservation.courtName}</p>
                </div>
              </div>
              
              <div className="flex gap-10">
                <div>
                  <p className="text-[9px] uppercase font-bold text-on-surface-variant/40 tracking-widest mb-0.5">Date</p>
                  <p className="font-headline font-black text-on-surface text-sm">{format(startDate, 'dd MMMM yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-on-surface-variant/40 tracking-widest mb-0.5">Heure</p>
                  <p className="font-headline font-black text-on-surface text-sm">{format(startDate, 'HH:mm')}</p>
                </div>
              </div>
            </div>
            
            {/* Background Icon */}
            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] rotate-12 pointer-events-none">
              <span className="material-symbols-outlined text-[100px]">event_busy</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full py-5 bg-error text-white rounded-full font-headline font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined">delete_forever</span>
                  Confirmer l'annulation
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={submitting}
              className="w-full py-5 bg-surface-container text-on-surface font-headline font-black text-xs uppercase tracking-[0.2em] rounded-full hover:bg-surface-container-high transition-all active:scale-95"
            >
              Conserver ma réservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
