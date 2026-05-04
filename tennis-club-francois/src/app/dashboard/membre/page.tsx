'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMemberDashboardData, type MemberDashboardData } from './actions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReservationModal from '@/components/dashboard/membre/ReservationModal';

export default function MembreDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<MemberDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      console.log('[Member Dashboard] Chargement des données...');
      const result = await getMemberDashboardData();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des données');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9faf8]">
        <div className="w-16 h-16 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9faf8] p-4 text-center">
        <span className="material-symbols-outlined text-6xl text-[#ba1a1a] mb-4">error</span>
        <h2 className="text-2xl font-headline font-black text-[#01261f] mb-2">Une erreur est survenue</h2>
        <p className="text-[#414846] mb-8">{error || 'Compte introuvable ou session expirée'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#01261f] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 md:pb-8">
      {/* Header / Role Adaptation UI */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="font-headline text-4xl md:text-5xl font-black text-[#01261f] tracking-tight">
            Bonjour, {data.profile.prenom || 'Mathieu'}
          </h2>
          <p className="text-[#414846] font-bold mt-1 text-lg italic tracking-tighter">Prêt pour votre match aujourd'hui ?</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#f3f4f2] p-2 rounded-full border border-white/40 shadow-sm animate-fade-in">
          <div className="bg-white text-[#01261f] px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[#01261f]/10 border border-[#c1c8c4]/30 transition-all cursor-default">Membre</div>
          {/* Profile Avatar */}
          <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#c5eadf] shadow-md p-0.5">
            {data.profile.avatar_url ? (
              <img className="w-full h-full object-cover rounded-full" src={data.profile.avatar_url} alt="Profile" />
            ) : (
              <div className="w-full h-full bg-[#1a3c34]/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#1a3c34] text-2xl">person</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 grid-rows-[auto_auto_auto] gap-8">
        
        {/* Widget 1: Prochaine Réservation (Span 4) */}
        <section className="col-span-12 lg:col-span-4 row-span-2 bg-[#1a3c34] text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl group hover:-translate-y-2 transition-all duration-500 border border-white/5">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-12">
              <span className="bg-[#9b4426] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20">Confirmé</span>
              <span className="material-symbols-outlined text-[#ffb59d] text-2xl drop-shadow-glow">verified</span>
            </div>
            
            <div className="mt-auto">
              <h3 className="text-[#c5eadf] font-headline text-[11px] font-black uppercase tracking-[0.3em] mb-4">Prochaine Réservation</h3>
              {data.nextReservation ? (
                <>
                  <p className="text-4xl font-headline font-black leading-tight tracking-tighter mb-8 italic">
                    Court {data.nextReservation.court_nom}
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-12 h-12 rounded-[1.2rem] bg-white/10 flex items-center justify-center group-hover/item:bg-[#9b4426] transition-colors shadow-inner">
                        <span className="material-symbols-outlined text-[#ffb59d] text-2xl">calendar_today</span>
                      </div>
                      <span className="font-headline font-bold text-xl tracking-tight">
                        {format(new Date(data.nextReservation.date_heure_debut), "EEEE d MMMM", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-12 h-12 rounded-[1.2rem] bg-white/10 flex items-center justify-center group-hover/item:bg-[#9b4426] transition-colors shadow-inner">
                        <span className="material-symbols-outlined text-[#ffb59d] text-2xl">schedule</span>
                      </div>
                      <span className="font-headline font-black text-3xl tracking-tighter">
                        {format(new Date(data.nextReservation.date_heure_debut), "HH:mm")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-2xl font-headline font-bold text-white/30 italic">Pas de match prévu</p>
              )}
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/membre/planning')}
              className="mt-12 w-full py-5 bg-white/10 backdrop-blur-xl rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest transition-all border border-white/10 hover:bg-white/20 active:scale-[0.98]"
            >
              Modifier la session
            </button>
          </div>
          
          {/* Abstract pattern bg */}
          <div className="absolute -right-16 -bottom-16 opacity-5 rotate-12 pointer-events-none group-hover:rotate-[30deg] transition-transform duration-1000">
            <span className="material-symbols-outlined text-[350px]" style={{ fontVariationSettings: "'FILL' 0" }}>grid_on</span>
          </div>
        </section>

        {/* Widget 2: Courts Disponibles (Span 5) */}
        <section className="col-span-12 lg:col-span-5 bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(1,38,31,0.05)] hover:-translate-y-2 transition-all duration-500 border border-[#c1c8c4]/30">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-[11px] text-[#414846] uppercase tracking-[0.25em] mb-1">Occupation en Direct</h3>
              <p className="text-2xl font-headline font-black text-[#01261f]">Club en Temps Réel</p>
            </div>
            <div className="flex gap-4 bg-[#f3f4f2] px-5 py-2.5 rounded-full border border-[#c1c8c4]/20 shadow-inner">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[10px] font-black text-[#414846] uppercase">Libre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#9b4426] shadow-[0_0_12px_rgba(155,68,38,0.5)]" />
                <span className="text-[10px] font-black text-[#414846] uppercase">Occupé</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {data.courtsStatus.map((court, idx) => (
              <button 
                key={court.id} 
                onClick={() => { setSelectedCourtId(court.id); setIsModalOpen(true); }}
                className="p-6 bg-[#f3f4f2] hover:bg-white hover:shadow-xl hover:shadow-[#01261f]/5 rounded-[2rem] border border-[#c1c8c4]/10 transition-all duration-300 flex flex-col items-center gap-4 group relative overflow-hidden text-left w-full"
              >
                <div className="w-full flex justify-between items-center relative z-10">
                  <span className="text-[11px] font-black text-[#414846]/20 tracking-widest uppercase">N°{idx + 1}</span>
                  <div className={`w-3.5 h-3.5 rounded-full ring-2 ring-white
                    ${court.isInMaintenance ? 'bg-[#ba1a1a] shadow-[0_0_15px_#ba1a1a]' : court.isOccupied ? 'bg-[#9b4426] shadow-[0_0_15px_#9b4426]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}
                  `} />
                </div>
                <div className="w-14 h-14 rounded-[1.3rem] bg-[#01261f]/5 flex items-center justify-center group-hover:bg-[#01261f]/10 transition-all duration-500 rotate-3 group-hover:rotate-0">
                  <span className={`material-symbols-outlined text-[2.2rem] ${court.isInMaintenance ? 'text-[#ba1a1a]' : 'text-[#01261f]'}`}>
                    {court.isInMaintenance ? 'build' : 'sports_tennis'}
                  </span>
                </div>
                <div className="text-center pb-2">
                  <p className="text-[12px] font-black text-[#01261f] uppercase tracking-widest leading-none mb-1">{court.nom}</p>
                  <p className="text-[10px] font-bold text-[#414846]/60 uppercase tracking-tighter">{court.type}</p>
                </div>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => { setSelectedCourtId(undefined); setIsModalOpen(true); }}
            className="w-full mt-8 py-5 border-2 border-[#01261f]/10 rounded-full text-[11px] font-black uppercase tracking-widest text-[#01261f] hover:bg-[#01261f] hover:text-white hover:border-[#01261f] shadow-lg transition-all duration-500"
          >
            Réserver en direct
          </button>
        </section>

        {/* Widget 3: Mon Coach (Span 3) */}
        <section className="col-span-12 lg:col-span-3 bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(1,38,31,0.05)] hover:-translate-y-2 transition-all duration-500 border border-[#c1c8c4]/30 flex flex-col">
          <h3 className="text-[#414846] font-black text-[11px] uppercase tracking-[0.25em] mb-10">Mon Coach</h3>
          
          <div className="flex items-center gap-6 mb-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden ring-4 ring-[#c5eadf] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=2071&auto=format&fit=crop" alt="Coach" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-lg">star</span>
              </div>
            </div>
            <div>
              <p className="font-headline font-black text-2xl text-[#01261f] leading-none mb-2">Fabrice Eloi</p>
              <p className="text-xs font-bold text-[#414846] uppercase tracking-widest">Master Pro</p>
            </div>
          </div>
          
          <div className="space-y-6 mt-auto">
            <div className="flex justify-between items-end text-sm">
              <span className="text-[#414846] font-bold uppercase tracking-tighter">Prochaine Session</span>
              <span className="font-black text-[#9b4426] text-lg">Jeu. 10:00</span>
            </div>
            <div className="w-full bg-[#f3f4f2] h-4 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-black/5">
              <div className="bg-[#01261f] h-full w-3/4 rounded-full shadow-[0_0_10px_rgba(1,38,31,0.3)]"></div>
            </div>
            <p className="text-[10px] text-[#414846]/60 font-black uppercase tracking-widest text-center">Progression: 75% du programme</p>
          </div>
          
          <button className="mt-8 w-full py-4 bg-[#01261f] text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-[#01261f]/20 transition-all active:scale-[0.98]">
            Contacter Fabrice
          </button>
        </section>

        {/* Widget 4: Activités (Span 8) */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(1,38,31,0.05)] hover:-translate-y-2 transition-all duration-500 border border-[#c1c8c4]/30 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h3 className="font-black text-[11px] text-[#414846] uppercase tracking-[0.25em] mb-1">Activités du Moment</h3>
              <p className="text-4xl font-headline font-black text-[#01261f]">Équipements & Services</p>
            </div>
            <button className="w-14 h-14 rounded-full bg-[#f3f4f2] text-[#01261f] flex items-center justify-center hover:bg-[#01261f] hover:text-white transition-all shadow-lg border border-[#c1c8c4]/30 group/btn">
              <span className="material-symbols-outlined group-hover/btn:rotate-180 transition-transform">filter_list</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="group/card flex items-center gap-6 p-8 bg-[#f3f4f2]/50 hover:bg-[#1a3c34] rounded-[2.2rem] border border-[#c1c8c4]/10 transition-all duration-500 cursor-pointer overflow-hidden relative">
              <div className="w-16 h-16 bg-[#c5eadf] rounded-[1.3rem] flex items-center justify-center text-[#01261f] group-hover/card:bg-white/20 group-hover/card:text-white transition-all shadow-lg shadow-[#01261f]/5">
                <span className="material-symbols-outlined text-4xl">pool</span>
              </div>
              <div>
                <h4 className="font-headline font-black text-lg uppercase tracking-tight group-hover/card:text-white transition-colors">Espace Détente</h4>
                <p className="text-xs font-bold text-[#414846]/60 mt-1 uppercase group-hover/card:text-white/60 transition-colors">Piscine & Spa • Ouvert - 21h</p>
              </div>
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover/card:scale-150 transition-transform duration-700"></div>
            </div>
            
            <div className="group/card flex items-center gap-6 p-8 bg-[#f3f4f2]/50 hover:bg-[#9b4426] rounded-[2.2rem] border border-[#c1c8c4]/10 transition-all duration-500 cursor-pointer overflow-hidden relative">
              <div className="w-16 h-16 bg-[#ffdbd0] rounded-[1.3rem] flex items-center justify-center text-[#9b4426] group-hover/card:bg-white/20 group-hover/card:text-white transition-all shadow-lg shadow-[#9b4426]/5">
                <span className="material-symbols-outlined text-4xl">restaurant</span>
              </div>
              <div>
                <h4 className="font-headline font-black text-lg uppercase tracking-tight group-hover/card:text-white transition-colors">Club House</h4>
                <p className="text-xs font-bold text-[#414846]/60 mt-1 uppercase group-hover/card:text-white/60 transition-colors">Menu Spécial • Après-Match</p>
              </div>
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover/card:scale-150 transition-transform duration-700"></div>
            </div>
          </div>
        </section>

        {/* Widget 5: Actualités (Span 4) */}
        <section className="col-span-12 lg:col-span-4 bg-[#01261f] rounded-[2.5rem] overflow-hidden shadow-2xl group hover:-translate-y-2 transition-all duration-700 relative min-h-[450px]">
          {data.clubEvent?.image ? (
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40" src={data.clubEvent.image} alt="Event" />
          ) : (
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40" src="https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?q=80&w=2072&auto=format&fit=crop" alt="Default Event" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#01261f] via-[#01261f]/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-10 text-white w-full">
            {data.clubEvent ? (
              <>
                <span className="bg-[#9b4426] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block shadow-xl">
                  {data.clubEvent.category}
                </span>
                <h4 className="text-3xl font-headline font-black leading-none mb-6 tracking-tight italic">
                  {data.clubEvent.title}
                </h4>
                <p className="text-white/70 font-medium text-sm line-clamp-2 leading-relaxed italic mb-8">
                  {data.clubEvent.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-3 border-[#01261f] bg-[#f9faf8] overflow-hidden shadow-xl ring-2 ring-white/10">
                        <img className="w-full h-full object-cover" src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Member" />
                      </div>
                    ))}
                    {data.clubEvent.participantsCount > 0 && (
                      <div className="w-12 h-12 rounded-full border-3 border-[#01261f] bg-[#c5eadf] flex items-center justify-center text-[10px] font-black text-[#01261f] shadow-xl ring-2 ring-white/10">
                        +{data.clubEvent.participantsCount}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => data.clubEvent?.link && window.open(data.clubEvent.link, '_blank')}
                    className="w-16 h-16 bg-white text-[#01261f] rounded-full flex items-center justify-center hover:bg-[#9b4426] hover:text-white transition-all shadow-2xl active:scale-90 group/nav"
                  >
                    <span className="material-symbols-outlined text-3xl group-hover/nav:translate-x-1 transition-transform">chevron_right</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-white/30 italic font-headline text-xl">Aucun événement prévu prochainement</p>
              </div>
            )}
          </div>
        </section>
        
      </div>

      <ReservationModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); }} 
        initialCourtId={selectedCourtId}
        courts={data.courtsStatus}
      />
    </div>
  );
}
