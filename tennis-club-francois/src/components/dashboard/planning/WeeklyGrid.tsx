'use client';

import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Reservation {
  id: string;
  courtId: string;
  userId: string;
  startTime: string;
  endTime: string;
  userName?: string;
  courtNom?: string;
}

interface WeeklyGridProps {
  currentWeekStart: Date;
  reservations: Reservation[];
  currentUserId: string;
  onSlotClick: (date: Date, hour: number) => void;
  isLoading?: boolean;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7h -> 22h

export function WeeklyGrid({ 
  currentWeekStart, 
  reservations, 
  currentUserId,
  onSlotClick,
  isLoading 
}: WeeklyGridProps) {
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getReservationsForSlot = (day: Date, hour: number) => {
    return reservations.filter(res => {
      const resDate = new Date(res.startTime);
      return isSameDay(resDate, day) && resDate.getHours() === hour;
    });
  };

  return (
    <div className="col-span-12 lg:col-span-9 bg-surface-container-low rounded-xl p-6 md:p-10 shadow-ambient border border-outline-variant/10 min-h-[600px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h2 className="font-headline text-2xl font-bold text-primary tracking-tight">Grille de Disponibilité</h2>
        
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-container border border-primary/20"></span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary-container/30 border border-secondary/20"></span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Ma Résa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-surface-container-lowest border border-outline-variant/30"></span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Libre</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar -mx-4 px-4">
        <table className="w-full border-separate border-spacing-2 min-w-[700px]">
          <thead>
            <tr>
              <th className="p-4 w-20"></th>
              {days.map((day) => (
                <th key={day.toISOString()} className="p-4 text-center group">
                  <span className={`block text-[10px] font-bold tracking-[0.2em] uppercase mb-1 ${isSameDay(day, new Date()) ? 'text-secondary' : 'text-on-surface-variant'}`}>
                    {format(day, 'EEE', { locale: fr })}
                  </span>
                  <span className={`text-2xl font-headline font-black transition-colors ${isSameDay(day, new Date()) ? 'text-secondary' : 'text-primary'}`}>
                    {format(day, 'dd', { locale: fr })}
                  </span>
                  {isSameDay(day, new Date()) && (
                    <div className="h-1 w-8 bg-secondary mx-auto mt-1 rounded-full" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="before:block before:h-4">
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="py-8 px-4 text-right align-middle font-bold text-[10px] text-on-surface-variant uppercase tracking-widest whitespace-nowrap border-r border-outline-variant/10">
                  {hour}:00
                </td>
                {days.map((day) => {
                  const slotReservations = getReservationsForSlot(day, hour);
                  const isUserRes = slotReservations.some(r => r.userId === currentUserId);
                  const isFull = slotReservations.length >= 6; // Supposons 6 courts max

                  return (
                    <td key={`${day.toISOString()}-${hour}`} className="relative h-24">
                      {isLoading ? (
                        <div className="h-full w-full bg-surface-container-lowest/50 rounded-lg animate-pulse" />
                      ) : slotReservations.length > 0 ? (
                        <div 
                          className={`h-full w-full rounded-lg p-3 flex flex-col justify-between border shadow-sm transition-all animate-scale-in cursor-default
                            ${isUserRes 
                              ? 'bg-secondary-container/20 border-secondary/30 text-secondary' 
                              : 'bg-primary-container border-primary/20 text-white'}`}
                        >
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${isUserRes ? 'text-secondary/80' : 'text-primary-fixed-dim/80'}`}>
                              {slotReservations.length} Réservation{slotReservations.length > 1 ? 's' : ''}
                            </span>
                            <span className="text-[11px] font-medium leading-tight truncate">
                              {isUserRes ? 'Ma Résa' : `${slotReservations[0].userName || 'Réservé'}`}
                            </span>
                          </div>
                          {slotReservations.length < 6 && (
                            <button 
                              onClick={() => onSlotClick(day, hour)}
                              className={`text-[9px] font-bold uppercase tracking-widest mt-auto self-end px-2 py-1 rounded transition-colors
                                ${isUserRes ? 'bg-secondary text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                            >
                              Réserver
                            </button>
                          )}
                        </div>
                      ) : (
                        <div 
                          onClick={() => onSlotClick(day, hour)}
                          className="h-full w-full bg-surface-container-lowest rounded-lg border border-outline-variant/5 shadow-sm hover:border-secondary/40 hover:bg-secondary/5 transition-all cursor-pointer flex items-center justify-center group"
                        >
                           <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
