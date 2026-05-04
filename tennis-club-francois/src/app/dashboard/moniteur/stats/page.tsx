import React from 'react';
import Link from 'next/link';

const IconTrendingUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);

const IconPayments = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
);

const IconSportsTennis = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M7 12a5 5 0 0 1 5-5" /><path d="M12 17a5 5 0 0 1 5-5" /></svg>
);

export default function MoniteurStatsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in p-6 lg:p-12">
      {/* Header section with back button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-emerald-950/5 pb-10">
        <div className="space-y-4">
          <Link 
            href="/dashboard/moniteur" 
            className="group inline-flex items-center text-xs font-black uppercase tracking-widest text-emerald-900/40 hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-sm mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Retour
          </Link>
          <h1 className="font-headline text-5xl font-black text-emerald-950 tracking-tighter">Statistiques & Gains des Cours</h1>
          <p className="text-secondary font-medium text-xl opacity-70 italic">Analyse de performance et suivi financier de mon activité au Tennis Club François.</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-3xl shadow-ambient border border-emerald-900/5 flex items-center gap-8">
           <div className="text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Période actuelle</p>
             <p className="text-sm font-bold text-emerald-950 mt-1">Octobre 2026</p>
           </div>
           <span className="w-px h-8 bg-emerald-950/5"></span>
           <div className="text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Prochain Versement</p>
             <p className="text-sm font-bold text-emerald-600 mt-1">05 Nov. 2026</p>
           </div>
        </div>
      </div>

      {/* Main stats boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Total Earnings */}
        <div className="bg-emerald-950 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-12 -bottom-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
            <span className="material-symbols-outlined text-[15rem]" style={{ fontVariationSettings: "'FILL' 1" }}>euro_symbol</span>
          </div>
          <div className="relative z-10 space-y-8">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <IconPayments />
            </div>
            <div>
              <p className="text-7xl font-black tracking-tighter">1,240€</p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100/40 mt-2">Gains nets ce mois-ci (+12%)</p>
            </div>
          </div>
        </div>

        {/* Sessions hours */}
        <div className="bg-white p-10 rounded-[40px] shadow-ambient border border-emerald-900/5 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 opacity-5 -rotate-12 group-hover:scale-110 transition-transform duration-1000">
            <span className="material-symbols-outlined text-[15rem]" style={{ fontVariationSettings: "'FILL' 1" }}>history_toggle_off</span>
          </div>
          <div className="relative z-10 space-y-8">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
              <IconTrendingUp />
            </div>
            <div>
              <p className="text-7xl font-black text-emerald-950 tracking-tighter">42.5h</p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-900/30 mt-2">Volume d'heures assurées</p>
            </div>
          </div>
        </div>

        {/* Most used court or top student type */}
        <div className="bg-emerald-50 p-10 rounded-[40px] shadow-ambient border border-emerald-600/10 relative overflow-hidden group">
          <div className="relative z-10 space-y-8">
            <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600">
              <IconSportsTennis />
            </div>
            <div>
              <p className="text-7xl font-black text-emerald-950 tracking-tighter">74%</p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-900/30 mt-2">Taux d'occupation planning</p>
            </div>
          </div>
          <div className="mt-8 flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 bg-emerald-600/20 h-12 rounded-lg relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 transition-all duration-1000" style={{ height: `${20 + Math.random() * 80}%` }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 bg-white rounded-[40px] p-12 shadow-ambient border border-emerald-900/5 space-y-10">
          <h3 className="font-headline text-3xl font-bold text-emerald-950 tracking-tight">Répartition de l'Activité</h3>
          <div className="space-y-8">
            {[
              { label: 'Cours Individuels (Adultes)', count: 24, percent: 56, color: 'bg-emerald-600' },
              { label: 'Cours Collectifs (Juniors)', count: 12, percent: 28, color: 'bg-secondary' },
              { label: 'Stages & Compétitions', count: 6, percent: 16, color: 'bg-emerald-950' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                   <div className="flex flex-col">
                      <span className="font-bold text-emerald-950 text-lg">{item.label}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-900/30">{item.count} sessions ce mois</span>
                   </div>
                   <span className="text-3xl font-black text-emerald-950 tracking-tighter">{item.percent}%</span>
                </div>
                <div className="h-4 bg-gray-50 rounded-full overflow-hidden">
                   <div className={`${item.color} h-full transition-all duration-1000`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-white rounded-[40px] p-12 shadow-ambient border border-emerald-900/5">
           <h3 className="font-headline text-3xl font-bold text-emerald-950 tracking-tight mb-8">Evolution du Chiffre</h3>
           <div className="space-y-6">
             {[
               { month: 'Juillet', val: '980€', progress: 40 },
               { month: 'Août', val: '720€', progress: 30 },
               { month: 'Septembre', val: '1,050€', progress: 75 },
               { month: 'Octobre', val: '1,240€', progress: 100, current: true },
             ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-6 p-4 rounded-3xl transition-all ${item.current ? 'bg-secondary/5 ring-1 ring-secondary/20' : 'opacity-50 hover:opacity-100'}`}>
                  <div className="text-center min-w-[80px]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">{item.month}</span>
                  </div>
                  <div className="flex-grow h-2 bg-emerald-950/5 rounded-full overflow-hidden">
                    <div className={`${item.current ? 'bg-secondary' : 'bg-emerald-950'} h-full`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <span className="font-black text-emerald-950">{item.val}</span>
                  </div>
                </div>
             ))}
           </div>
           <div className="mt-12 bg-gray-50 p-6 rounded-3xl border border-dashed border-emerald-900/10 text-center">
             <p className="text-sm font-medium text-emerald-900/40">Historique complet disponible sur demande à l'administration.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
