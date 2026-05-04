'use client';

import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, startOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlanningHeader } from '@/components/dashboard/planning/PlanningHeader';
import { CourtStatusSidebar } from '@/components/dashboard/planning/CourtStatusSidebar';
import { WeeklyGrid } from '@/components/dashboard/planning/WeeklyGrid';
import { ReservationModal } from '@/components/dashboard/planning/ReservationModal';
import { getWeeklyPlanningData, createReservationAction } from './actions';
import type { WeeklyPlanningData } from './actions';

/**
 * Main Planning View - Client Component
 * Manages states: Loading, Success, Error, Empty
 */
export default function PlanningPage() {
  // 1. States
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [data, setData] = useState<WeeklyPlanningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 1.1 Modal Status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
  
  // 2. Fetch Logic
  const fetchPlanning = useCallback(async (weekStart: Date) => {
    setIsLoading(true);
    setError(null);
    
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    try {
      const result = await getWeeklyPlanningData(weekStart.toISOString(), weekEnd.toISOString());
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erreur lors de la récupération du planning');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Une erreur technique est survenue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanning(currentWeekStart);
  }, [currentWeekStart, fetchPlanning]);

  // 3. Handlers
  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedSlot({ date, hour });
    setIsModalOpen(true);
  };

  const handleConfirmReservation = async (courtId: string, startTime: string, endTime: string) => {
    try {
      const result = await createReservationAction({
        courtId,
        startTime,
        endTime,
      });

      if (result.success) {
        // Success feedback will be handled by revalidation and modal closing
        fetchPlanning(currentWeekStart); 
      } else {
        alert('Erreur: ' + result.error);
        throw new Error(result.error); // Re-throw to keep modal open if necessary or show error in modal
      }
    } catch (err) {
      alert('Erreur technique lors de la réservation.');
      throw err;
    }
  };

  // 4. Render States
  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in px-4 py-8">
      
      {/* 4 States Logic Implementation */}
      
      <PlanningHeader 
        currentWeekStart={currentWeekStart} 
        onPrevWeek={() => setCurrentWeekStart(prev => subWeeks(prev, 1))}
        onNextWeek={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}
        onToday={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
      />

      <div className="grid grid-cols-12 gap-8">
        
        {/* Sidebar Status */}
        <CourtStatusSidebar 
          courts={data?.courts || []} 
          isLoading={isLoading} 
        />

        {/* Main Grid Card */}
        <div className="col-span-12 lg:col-span-9 relative">
          
          {error && !isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
              <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
              <p className="text-primary font-headline font-bold text-xl">{error}</p>
              <button 
                onClick={() => fetchPlanning(currentWeekStart)}
                className="mt-6 px-6 py-2 bg-secondary text-white rounded-full font-bold uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Réessayer
              </button>
            </div>
          )}

          <WeeklyGrid 
            currentWeekStart={currentWeekStart}
            reservations={data?.reservations || []}
            currentUserId={data?.currentUserId || ''}
            onSlotClick={handleSlotClick}
            isLoading={isLoading}
          />
        </div>
      </div>


      {/* Reservation Modal */}
      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReservation}
        selectedDate={selectedSlot?.date || null}
        selectedHour={selectedSlot?.hour ?? null}
        courts={data?.courts || []}
      />

    </div>
  );
}
