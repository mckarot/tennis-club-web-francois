'use client';

/**
 * Grille de Planning Interactive - Dashboard Admin
 * Tennis Club du François
 */

import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type PlanningDayData, type Court, type Reservation } from '@/lib/types/planning';
import { getPlanningData, syncCourtsDesign, reserveSlotAction } from '@/app/dashboard/admin/planning/actions';
import { getMembersAction } from '@/app/dashboard/actions';
import { useRouter } from 'next/navigation';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 to 21:00

interface Member {
  user: string;
  nom: string;
  prenom: string;
}

export function PlanningGrid({ initialData }: { initialData: PlanningDayData }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [planningData, setPlanningData] = useState<PlanningDayData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: number, hour: number } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Charger les données quand la date change
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getPlanningData(selectedDate.toISOString());
      if (data.courts.length === 0) {
        await syncCourtsDesign();
        const retryData = await getPlanningData(selectedDate.toISOString());
        setPlanningData(retryData);
      } else {
        setPlanningData(data);
      }
    } catch (error) {
      console.error("Erreur chargement planning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Charger les membres au montage
  useEffect(() => {
    const fetchMembers = async () => {
      const result = await getMembersAction({ limit: 100 });
      if (result.success && result.data) {
        setMembers(result.data.members as unknown as Member[]);
      }
    };
    fetchMembers();
  }, []);

  const handleConfirmReservation = async () => {
    if (!selectedSlot || !selectedMemberId) {
      alert("Veuillez sélectionner un élève.");
      return;
    }

    setIsReserving(true);
    try {
      const startTime = setMinutes(setHours(selectedDate, selectedSlot.hour), 0).toISOString();
      const endTime = setMinutes(setHours(selectedDate, selectedSlot.hour + 1), 0).toISOString();

      const result = await reserveSlotAction({
        courtId: selectedSlot.courtId,
        startTime,
        endTime,
        userId: selectedMemberId
      });

      if (result.success) {
        setSelectedSlot(null);
        setSelectedMemberId('');
        await fetchData();
      } else {
        alert(result.error || "Erreur lors de la réservation.");
      }
    } catch (error) {
      alert("Erreur système lors de la réservation.");
    } finally {
      setIsReserving(false);
    }
  };

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(next => addDays(next, 1));

  const isReserved = (courtId: number, hour: number) => {
    return planningData.reservations.find(r => {
      const start = new Date(r.start_time);
      return r.court === courtId && start.getHours() === hour;
    });
  };

  return (
    <section className="grid grid-cols-1 gap-8">
      {/* Navigation & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-surface-container-low p-4 rounded-full px-8 gap-4 border border-outline-variant/10">
        <div className="flex items-center gap-6">
          <button 
            onClick={handlePrevDay}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-lowest text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-outline-variant/5"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          <div className="text-center min-w-[200px]">
            <span className="block text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest leading-none mb-1">
              {format(selectedDate, 'EEEE', { locale: fr })}
            </span>
            <span className="block text-lg font-headline font-bold text-primary capitalize">
              {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>

          <button 
            onClick={handleNextDay}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-lowest text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-outline-variant/5"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border border-outline-variant/30"></div>
            <span className="text-[11px] font-medium text-on-surface-variant">Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-container/20"></div>
            <span className="text-[11px] font-medium text-on-surface-variant">Occupé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-[11px] font-medium text-on-surface-variant">Sélection</span>
          </div>
        </div>
      </div>

      {/* Booking Matrix */}
      <div className={`bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto hide-scrollbar">
          <div className="min-w-[1000px]">
            {/* Court Labels Row */}
            <div className="grid grid-cols-7 border-b border-outline-variant/10 bg-surface-container-low/20">
              <div className="p-6 flex items-center justify-center border-r border-outline-variant/10">
                <span className="material-symbols-outlined text-primary/40 text-xl">schedule</span>
              </div>
              {planningData.courts.map(court => (
                <div key={court.id} className="p-6 text-center border-r border-outline-variant/10 last:border-r-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 mb-1">
                    Tennis Court {court.id}
                  </p>
                  <p className="font-headline font-bold text-primary text-sm tracking-tight">{court.type}</p>
                </div>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="divide-y divide-outline-variant/10">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-7 group/row">
                  <div className="p-4 flex items-center justify-center bg-surface-container-low/30 border-r border-outline-variant/10">
                    <span className="font-headline font-bold text-primary/60 text-sm">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>

                  {planningData.courts.map(court => {
                    const reservation = isReserved(court.id, hour);
                    const isSelected = selectedSlot?.courtId === court.id && selectedSlot?.hour === hour;

                    if (reservation) {
                      return (
                        <div 
                          key={`${court.id}-${hour}`} 
                          className="h-20 border-r border-outline-variant/10 last:border-r-0 bg-primary-container/10 flex items-center justify-center px-4"
                        >
                          <div className="w-full h-12 bg-primary-container/20 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-on-primary-container/70 uppercase tracking-tighter">
                              Occupé
                            </span>
                            <span className="text-[9px] text-on-primary-container/50 font-medium truncate w-full px-2">
                              {reservation.user_details?.nom || 'Membre'}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={`${court.id}-${hour}`}
                        onClick={() => setSelectedSlot({ courtId: court.id, hour })}
                        className={`h-20 border-r border-outline-variant/10 last:border-r-0 transition-all group/slot relative overflow-hidden flex flex-col items-center justify-center
                          ${isSelected ? 'bg-secondary text-white' : 'hover:bg-surface-container/50 bg-white'}
                        `}
                      >
                        {isSelected ? (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">Cliqué</span>
                            <span className="font-headline font-bold text-sm">Réserver</span>
                          </>
                        ) : (
                          <div className="absolute inset-0 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary/40 text-xl font-light">add</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Carte de Confirmation - Maintenant Fixe au Centre du Viewport */}
      {selectedSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay avec flou professionnel */}
          <div 
            className="absolute inset-0 bg-[#021c18]/80 backdrop-blur-xl animate-in fade-in duration-700" 
            onClick={() => setSelectedSlot(null)}
          />
          
          <div className="relative z-10 w-full max-w-lg bg-[#02342a] border border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.3)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
             {/* Décoration d'arrière-plan thématique */}
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />
             <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500/10 blur-[90px] rounded-full pointer-events-none" />

             <div className="relative z-10">
               <div className="flex items-center gap-6 mb-8 text-left">
                 <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                   <span className="material-symbols-outlined text-emerald-400 text-3xl">sports_tennis</span>
                 </div>
                 <div className="flex-1">
                   <h3 className="font-headline text-3xl font-black text-white tracking-tighter leading-none mb-1">Planification du cours</h3>
                   <div className="flex items-center gap-2">
                     <span className="text-orange-400 font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/20">
                       {planningData.courts.find(c => c.id === selectedSlot.courtId)?.type || 'Terre Battue'}
                     </span>
                     <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                       Court {selectedSlot.courtId}
                     </span>
                   </div>
                 </div>
               </div>

               <div className="space-y-5 mb-10">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-left group hover:bg-white/10 transition-all duration-300">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-orange-400 text-xl">schedule</span>
                     </div>
                     <div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">HORAIRE DU COURS</div>
                       <div className="text-lg text-white font-black">
                         {format(selectedDate, 'EEEE d MMMM', { locale: fr })} <span className="text-emerald-400">à {selectedSlot.hour}:00</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="text-left">
                   <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 ml-1">
                     ÉLÈVE À INSCRIRE (MEMBRE)
                   </label>
                   <div className="relative group">
                     <select 
                       className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-4.5 px-6 text-white font-black text-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all cursor-pointer appearance-none shadow-xl"
                       value={selectedMemberId}
                       onChange={(e) => setSelectedMemberId(e.target.value)}
                     >
                       <option value="" className="bg-[#02342a] text-white/40">SÉLECTIONNEZ UN ÉLÈVE...</option>
                       {members.map(member => (
                         <option key={member.user} value={member.user} className="bg-[#02342a] text-white py-4">
                           {member.prenom} {member.nom}
                         </option>
                       ))}
                     </select>
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-emerald-400 transition-colors">
                       <span className="material-symbols-outlined text-2xl">unfold_more</span>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setSelectedSlot(null)}
                   className="py-4.5 rounded-2xl border border-white/5 text-white/60 font-black hover:bg-white/5 hover:text-white transition-all text-[11px] uppercase tracking-[0.2em]"
                 >
                   ANNULER
                 </button>
                 <button 
                   disabled={isReserving || !selectedMemberId}
                   onClick={handleConfirmReservation}
                   className={`py-4.5 rounded-2xl font-headline font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl
                     ${(isReserving || !selectedMemberId) 
                        ? 'bg-white/5 text-white/10 cursor-not-allowed' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-[1.03] active:scale-[0.97] shadow-emerald-500/30'}
                   `}
                 >
                   {isReserving ? (
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   ) : (
                     <span className="material-symbols-outlined">verified</span>
                   )}
                   {isReserving ? 'VALIDATION...' : 'RÉSERVER MAINTENANT'}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </section>
  );
}
