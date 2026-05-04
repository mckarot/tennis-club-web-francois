'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMyReservations, cancelReservationAction } from './actions';
import type { MyReservationsData } from './actions';
import { ReservationCard } from './ReservationCard';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MyReservationsPage() {
  const [data, setData] = useState<MyReservationsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMyReservations();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erreur lors de la récupération des données');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Erreur technique');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancel = async (id: string) => {
    const result = await cancelReservationAction(id);
    if (result.success) {
      fetchData(); // Refresh data Locally
    } else {
      alert(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 md:p-12 lg:p-20 max-w-[1440px] mx-auto w-full animate-pulse">
        <div className="h-16 w-1/3 bg-surface-container-high rounded-xl mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-surface-container-low rounded-xl" />
            <div className="h-48 bg-surface-container-low rounded-xl" />
          </div>
          <div className="lg:col-span-4 h-96 bg-surface-container-low rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 lg:p-20 max-w-[1440px] mx-auto w-full animate-fade-in">
      
      {/* Header Section */}
      <header className="mb-16">
        <h1 className="text-5xl font-headline font-black text-primary tracking-tight mb-4">Mes Réservations</h1>
        <p className="text-on-surface-variant font-medium max-w-2xl leading-relaxed">Gérez vos prochains matchs et consultez l'historique de vos sessions sur la terre battue.</p>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Active Reservations Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-black text-primary flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">event_available</span>
              Réservations à venir
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 bg-surface-container px-4 py-1.5 rounded-full">
              {data?.upcoming.length || 0} Réservations
            </span>
          </div>

          {data?.upcoming.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant/30">
              <span className="material-symbols-outlined text-6xl text-outline-variant/50 mb-6">sports_tennis</span>
              <h3 className="font-headline font-bold text-xl text-primary mb-2">Aucune réservation prévue</h3>
              <p className="text-on-surface-variant max-w-xs mb-8">C'est le moment idéal pour fouler les courts du club !</p>
              <button 
                onClick={() => window.location.href = '/dashboard/membre/planning'}
                className="bg-secondary text-white py-4 px-8 rounded-full font-headline font-bold uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all"
              >
                Réserver mon premier match
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {data?.upcoming.map((res) => (
                <ReservationCard 
                  key={res.id} 
                  reservation={res} 
                  onCancel={handleCancel}
                  isFuture={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar / Stats Section */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Season Stats Summary */}
          <div className="bg-primary p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-primary/30 group">
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-primary-fixed-dim text-lg mb-2">Récap Saison</h3>
              <div className="text-6xl font-black font-headline tracking-tighter mb-6 group-hover:scale-105 transition-transform duration-500 origin-left">
                {data?.stats.totalHours} 
                <span className="text-base font-medium tracking-normal text-primary-fixed-dim/60 ml-2 italic">heures jouées</span>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 rotate-12">
              <span className="material-symbols-outlined text-[180px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_tennis</span>
            </div>
          </div>

          {/* Historique des réservations */}
          <div className="bg-surface-container-low rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-ambient">
            <h3 className="font-headline font-black text-primary text-xl mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">history</span>
              Historique des réservations
            </h3>
            
            <div className="space-y-8">
              {data?.past.length === 0 ? (
                <p className="text-on-surface-variant text-sm italic font-medium">Aucune réservation passée.</p>
              ) : (
                data?.past.map((res) => {
                  let statusLabel = 'COMPLÉTÉ';
                  let isError = false;
                  
                  if (res.status === 'annulée') {
                    statusLabel = 'ANNULÉ';
                    isError = true;
                  } else if (res.status === 'absence') {
                    statusLabel = 'ABSENT';
                    isError = true;
                  } else if (res.status === 'provisoire') {
                    statusLabel = 'EN ATTENTE';
                  }
                  
                  return (
                    <div key={res.id} className="flex justify-between items-start pb-6 border-b border-outline-variant/10 last:border-0 hover:translate-x-1 transition-transform duration-300">
                      <div>
                        <p className="font-headline font-bold text-primary mb-1">
                          {format(parseISO(res.startTime), 'dd MMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-2 font-medium">
                          {res.courtName} • {format(parseISO(res.startTime), 'HH:mm')}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-full ${isError ? 'bg-error-container text-on-error-container' : 'bg-primary/10 text-primary'}`}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            
          </div>

          {/* Club Coaching Promo */}
          <div className="rounded-[2.5rem] overflow-hidden relative group aspect-[4/5] shadow-2xl">
            <img 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110" 
              alt="Coach André" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxKHX8_TvAkrfJZZfjs3ATxB1G_WJJ8XAGCiQ13dpXPKRQeBg7xMmT4BsK8vvbilk2Fgz8GiH8Lkvnx98NfCYIuV9mGoOn3TXlyiZ3aJ6qyQUpM6r-DNL70s1qIoYwV4RXYnTxFKOTvLQPeZ6AGTjpx-g5G9dVM1cuJUPPm0o3fNDkd386RWSAqJwcBd99Lo1hyu2tGMtOzU1JPNFvWoJFh108yzqRKY5knrKhcLOKX3WKHJnfN6IosKBv0B5YhDy5PFsJ8KY7l54" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent flex flex-col justify-end p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
              <p className="text-secondary-fixed text-xs font-black uppercase tracking-[0.3em] mb-3">CONSEILS PRO</p>
              <h4 className="text-white text-2xl font-headline font-extrabold leading-[1.1] mb-6 tracking-tight">Améliorez votre revers avec le Coach André.</h4>
              <button className="bg-secondary text-white rounded-full px-8 py-4 font-headline text-xs font-black uppercase tracking-widest w-fit shadow-xl hover:brightness-110 active:scale-95 transition-all">
                RÉSERVER UNE LEÇON
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
