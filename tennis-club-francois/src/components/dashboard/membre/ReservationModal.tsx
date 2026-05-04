'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAvailableSlots, createMemberReservation } from '@/app/dashboard/membre/actions';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourtId?: string;
  courts: {
    id: string;
    nom: string;
    type: string;
  }[];
}

export default function ReservationModal({ isOpen, onClose, initialCourtId, courts }: ReservationModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialisation côté client pour éviter Hydration Mismatch
  useEffect(() => {
    setIsClient(true);
    setSelectedDate(startOfToday());
    if (initialCourtId) {
      setSelectedCourt(initialCourtId);
    }
  }, [initialCourtId, isOpen]);

  // Load slots when court or date changes
  useEffect(() => {
    if (isClient && selectedCourt && selectedDate && isOpen) {
      const loadSlots = async () => {
        setLoadingSlots(true);
        setError(null);
        try {
          const slots = await getAvailableSlots(selectedCourt.toString(), selectedDate.toISOString());
          setAvailableSlots(slots);
        } catch (err) {
          setError("Impossible de charger les créneaux.");
        } finally {
          setLoadingSlots(false);
        }
      };
      loadSlots();
    }
  }, [selectedCourt, selectedDate, isClient, isOpen]);

  if (!isOpen || !isClient) return null;

  const handleConfirm = async () => {
    if (!selectedCourt || !selectedTime) return;

    setSubmitting(true);
    setError(null);
    console.info(`[Reservation Modal] Tentative de réservation finalisée pour Court ${selectedCourt}`);

    try {
      // Calcul des heures de début et fin côté client (fuseau local)
      const [hours] = selectedTime.split(':');
      const start = new Date(selectedDate);
      start.setHours(parseInt(hours), 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      const result = await createMemberReservation({
        courtId: selectedCourt.toString(),
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });

      if (result.success) {
        onClose();
        // Optionnel: Notification de succès
      } else {
        setError(result.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Erreur technique lors de la réservation.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#01261f]/80 backdrop-blur-md transition-opacity duration-500" onClick={onClose} />
      
      <div className="bg-[#f9faf8] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 animate-scale-in border border-white/20">
        {/* Header */}
        <div className="bg-[#064e3b] p-8 text-white relative">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-headline font-black tracking-tighter mb-1 uppercase italic">Réserver un Court</h2>
              <p className="text-emerald-100/60 text-xs font-black uppercase tracking-widest leading-none">Tennis Club du François</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
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

          {/* Stepper / Progress */}
          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#f97316]' : 'bg-[#e7e8e6]'}`} />
            ))}
          </div>

          {/* Step 1: Selection du Court */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="font-headline font-black text-[#01261f] text-xl mb-6 uppercase italic tracking-tight">1. Choisissez votre terrain</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => { setSelectedCourt(court.id); setStep(2); }}
                    className={`p-6 rounded-[2rem] border-2 transition-all group flex flex-col items-center gap-3 ${
                      selectedCourt === court.id 
                        ? 'border-[#f97316] bg-[#f97316]/5 shadow-lg' 
                        : 'border-[#e7e8e6] hover:border-[#01261f]/20 bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedCourt === court.id ? 'bg-[#f97316] text-white' : 'bg-[#f3f4f2] text-[#01261f]'}`}>
                      <span className="material-symbols-outlined text-2xl">sports_tennis</span>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-[11px] text-[#01261f] uppercase tracking-widest leading-none mb-1">{court.nom}</p>
                      <p className="text-[9px] font-bold text-[#414846]/60 uppercase tracking-tighter">{court.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Heure */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setStep(1)} className="text-[#01261f] hover:translate-x-[-4px] transition-transform flex items-center gap-1 font-black uppercase text-[10px] tracking-widest">
                  <span className="material-symbols-outlined text-lg">arrow_back</span> Retour
                </button>
                <h3 className="font-headline font-black text-[#01261f] text-xl uppercase italic tracking-tight">2. Date & Créneau</h3>
              </div>

              {/* Date Scroll */}
              <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
                {nextDays.map((date) => {
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                      className={`flex-shrink-0 w-20 h-24 rounded-[1.8rem] border-2 flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-[#f97316] bg-[#f97316] text-white shadow-xl translate-y-[-4px]' 
                          : 'border-[#e7e8e6] bg-white text-[#414846] hover:border-[#01261f]/20'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">{format(date, 'EEE', { locale: fr })}</span>
                      <span className="text-2xl font-headline font-black italic tracking-tighter">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slots Grid */}
              <div className="min-h-[200px]">
                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#414846]/60">Analyse des disponibilités...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => { setSelectedTime(time); setStep(3); }}
                          className={`py-4 rounded-2xl border-2 font-headline font-black text-lg transition-all ${
                            selectedTime === time 
                              ? 'border-[#f97316] bg-[#f97316]/5 text-[#f97316] shadow-sm' 
                              : 'border-[#e7e8e6] bg-white text-[#01261f] hover:border-[#01261f] shadow-sm'
                          }`}
                        >
                          {time}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-[#f3f4f2] rounded-[2rem] border border-dashed border-[#c1c8c4]">
                        <span className="material-symbols-outlined text-4xl text-[#c1c8c4] mb-3">event_busy</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#414846]/60">Désolé, plus de créneaux libres pour cette journée.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setStep(2)} className="text-[#01261f] hover:translate-x-[-4px] transition-transform flex items-center gap-1 font-black uppercase text-[10px] tracking-widest">
                  <span className="material-symbols-outlined text-lg">arrow_back</span> Retour
                </button>
                <h3 className="font-headline font-black text-[#01261f] text-xl uppercase italic tracking-tight">3. Confirmer le match</h3>
              </div>

              <div className="bg-[#1a3c34] rounded-[2.2rem] p-8 text-white shadow-2xl relative overflow-hidden mb-10">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ffb59d] text-3xl">sports_tennis</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-emerald-100/40 tracking-[0.2em] mb-1">Terrain Sélectionné</p>
                      <p className="text-xl font-headline font-black italic tracking-tighter uppercase">{courts.find(c => c.id === selectedCourt)?.nom}</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-emerald-100/40 tracking-[0.2em]">Date</p>
                      <p className="text-lg font-headline font-black italic uppercase tracking-tighter">{format(selectedDate, 'd MMMM yyyy', { locale: fr })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-emerald-100/40 tracking-[0.2em]">Heure</p>
                      <p className="text-lg font-headline font-black italic uppercase tracking-tighter">{selectedTime}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-5 rotate-12 pointer-events-none">
                  <span className="material-symbols-outlined text-[180px]">grid_on</span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full py-6 bg-[#9b4426] text-white rounded-full font-headline font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined">verified</span>
                    Valider ma réservation
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
