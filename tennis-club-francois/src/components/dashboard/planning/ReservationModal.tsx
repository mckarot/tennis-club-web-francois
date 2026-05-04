'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Court {
  id: string;
  nom: string;
  type: string;
  isOccupied: boolean;
  isInMaintenance: boolean;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (courtId: string, startTime: string, endTime: string) => Promise<void>;
  selectedDate: Date | null;
  selectedHour: number | null;
  courts: Court[];
}

/**
 * ReservationModal - A premium, stitch-compliant modal for court booking.
 * Features glassmorphism, smooth transitions, and intuitive UI.
 */
export function ReservationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedDate, 
  selectedHour,
  courts 
}: ReservationModalProps) {
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      // Auto-select first available court
      const firstAvailable = courts.find(c => !c.isInMaintenance && !c.isOccupied);
      if (firstAvailable) {
        setSelectedCourtId(firstAvailable.id);
      } else if (courts.length > 0) {
        setSelectedCourtId(courts[0].id);
      }
    }
  }, [isOpen, courts]);

  if (!isOpen || !selectedDate || selectedHour === null) return null;

  const handleConfirm = async () => {
    if (!selectedCourtId) return;
    
    setIsSubmitting(true);
    try {
      const startTime = new Date(selectedDate);
      startTime.setHours(selectedHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(selectedHour + 1, 0, 0, 0);

      await onConfirm(selectedCourtId, startTime.toISOString(), endTime.toISOString());
      onClose();
    } catch (error) {
      console.error('Reservation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with motion-blur */}
      <div 
        className="absolute inset-0 bg-primary/20 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 shadow-modal animate-slide-up border border-outline-variant/10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="font-headline font-bold text-2xl text-primary tracking-tight">Réserver un Court</h2>
            <p className="text-on-surface-variant text-sm font-medium">Club du François • Session de 1h</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 rounded-2xl p-4 mb-8 flex items-center gap-4 border border-primary/10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">calendar_today</span>
          </div>
          <div>
            <p className="text-primary font-bold">{format(selectedDate, 'EEEE dd MMMM', { locale: fr })}</p>
            <p className="text-secondary font-medium">De {selectedHour}h00 à {selectedHour + 1}h00</p>
          </div>
        </div>

        {/* Court Selection */}
        <div className="space-y-4 mb-8">
          <label className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">Sélectionner un court</label>
          <div className="grid grid-cols-1 gap-3">
            {courts.map((court) => {
              const isDisabled = court.isInMaintenance;
              const isSelected = selectedCourtId === court.id;
              
              return (
                <button
                  key={court.id}
                  disabled={isDisabled}
                  onClick={() => setSelectedCourtId(court.id)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border-2
                    ${isDisabled 
                      ? 'opacity-50 grayscale cursor-not-allowed bg-surface-container border-transparent' 
                      : isSelected 
                        ? 'bg-primary-container border-primary shadow-md scale-[1.02]' 
                        : 'bg-surface-container-low border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-high'
                    }
                  `}
                >
                  <div className="flex flex-col items-start">
                    <span className={`font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{court.nom}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{court.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {court.isInMaintenance ? (
                      <span className="text-[10px] font-bold text-error uppercase">Maintenance</span>
                    ) : court.isOccupied ? (
                      <span className="text-[10px] font-bold text-secondary uppercase">Déjà réservé</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Libre</span>
                    )}
                    <span className={`w-3 h-3 rounded-full ${court.isInMaintenance ? 'bg-secondary' : court.isOccupied ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-surface-container text-on-surface font-bold rounded-2xl hover:bg-surface-container-high transition-all active:scale-95"
          >
            Annuler
          </button>
          <button
            disabled={isSubmitting || !selectedCourtId}
            onClick={handleConfirm}
            className="flex-[2] py-4 bg-secondary text-primary-fixed-dim font-bold rounded-2xl shadow-ambient hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-primary-fixed-dim/30 border-t-primary-fixed-dim rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Confirmer
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
