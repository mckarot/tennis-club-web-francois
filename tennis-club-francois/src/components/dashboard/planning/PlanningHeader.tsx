'use client';

import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PlanningHeaderProps {
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export function PlanningHeader({ 
  currentWeekStart, 
  onPrevWeek, 
  onNextWeek, 
  onToday 
}: PlanningHeaderProps) {
  const weekEnd = addDays(currentWeekStart, 6);
  
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
      <div className="animate-fade-in">
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-primary leading-tight">
          Planning des Courts
        </h1>
        <p className="text-on-surface-variant mt-2 text-lg">
          Réservez votre créneau sur nos <span className="text-secondary font-bold">Terres Battues</span>
        </p>
      </div>

      <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-full border border-outline-variant/15 shadow-sm self-end md:self-auto animate-scale-in">
        <button 
          onClick={onPrevWeek}
          className="p-3 hover:bg-surface-container-high rounded-full transition-all text-primary"
          aria-label="Semaine précédente"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        
        <button 
          onClick={onToday}
          className="px-4 py-2 hover:bg-surface-container-high rounded-full transition-all text-primary font-headline font-bold text-xs uppercase tracking-widest"
        >
          Aujourd'hui
        </button>

        <span className="font-headline font-bold text-primary uppercase tracking-widest px-4 border-x border-outline-variant/20">
          {format(currentWeekStart, 'dd MMM', { locale: fr })} — {format(weekEnd, 'dd MMM', { locale: fr })}
        </span>

        <button 
          onClick={onNextWeek}
          className="p-3 hover:bg-surface-container-high rounded-full transition-all text-primary"
          aria-label="Semaine suivante"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </header>
  );
}
