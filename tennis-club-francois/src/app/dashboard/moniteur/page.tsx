import React from 'react';
import Link from 'next/link';
import { getMoniteurDashboardData } from './actions';

export default async function MoniteurDashboardPage() {
  let dashboardData;
  try {
    dashboardData = await getMoniteurDashboardData();
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    // Fallback if no authenticated session found (ex: for dev visualization if not properly logged in as moniteur)
  }

  const stats = [
    { label: 'Sessions du Jour', value: dashboardData?.stats.sessionsToday.toString() || '0', icon: 'schedule', color: 'text-secondary' },
    { label: 'Élèves Actifs', value: dashboardData?.stats.activeStudents.toString() || '0', icon: 'group', color: 'text-primary' },
    { label: 'Heures cette Semaine', value: `${dashboardData?.stats.hoursThisWeek || 0}h`, icon: 'timer', color: 'text-tertiary' },
    { label: 'Prochain Cours', value: dashboardData?.stats.nextSessionTime || '--:--', icon: 'event', color: 'text-secondary' },
  ];

  const sessions = dashboardData?.sessions || [];
  const courts = dashboardData?.courts || [];
  const recentStudents = dashboardData?.recentStudents || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Card & Quick Actions */}
      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-12 lg:col-span-8 bg-emerald-900 text-white rounded-xl p-10 relative overflow-hidden group shadow-ambient">
          <div className="relative z-10">
            <h2 className="font-headline text-4xl font-bold tracking-tight mb-2">Bonjour, {dashboardData?.profile.fullName || 'Coach'}</h2>
            <p className="text-emerald-100 text-lg opacity-90">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} — Une excellente journée pour le tennis.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 border border-white/10">
                <span className="material-symbols-outlined text-secondary">sunny</span>
                <span className="font-medium text-sm">28°C Martinique</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 border border-white/10">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <span className="font-medium text-sm">
                  {dashboardData?.stats.nextSessionTime !== '--:--' ? `Prochain cours à ${dashboardData?.stats.nextSessionTime}` : 'Aucune session à venir'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] group-hover:bg-secondary/30 transition-all duration-700"></div>
          <div className="absolute right-12 top-12 opacity-10">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_tennis</span>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <h3 className="font-headline text-xl font-bold px-2 text-emerald-950">Actions Rapides</h3>
          {[
            { label: 'Noter un élève', icon: 'edit_note', color: 'bg-blue-500/10 text-blue-600', href: '/dashboard/moniteur/notes' },
            { label: 'Statistiques & Gains', icon: 'trending_up', color: 'bg-emerald-950/10 text-emerald-950', href: '/dashboard/moniteur/stats' },
          ].map((action) => (
            <Link 
              key={action.label} 
              href={action.href}
              className="flex items-center justify-between w-full p-5 bg-white hover:bg-emerald-50 transition-all duration-300 rounded-xl group shadow-sm border border-emerald-900/5"
            >
              <div className="flex items-center gap-4">
                <span className={`w-12 h-12 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform ${action.color}`}>
                  <span className="material-symbols-outlined">{action.icon}</span>
                </span>
                <span className="font-semibold text-lg text-emerald-950">{action.label}</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </Link>
          ))}
        </section>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-emerald-900/5 hover:border-secondary/30 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 mb-4 ${stat.color} shadow-sm`}>
              <span className="material-symbols-outlined text-xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-black text-emerald-950 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-900/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sessions & Court Status */}
      <div className="grid grid-cols-12 gap-8">
        {/* Today's Sessions */}
        <section className="col-span-12 lg:col-span-5 bg-white rounded-xl p-8 flex flex-col gap-6 shadow-ambient border border-emerald-900/5">
          <div className="flex items-center justify-between font-headline">
            <h3 className="text-xl font-bold text-emerald-950 tracking-tight">Sessions du Jour</h3>
            <span className="text-[10px] uppercase font-black tracking-widest text-secondary px-3 py-1.5 bg-secondary/10 rounded-full">
              {sessions.length} Sessions
            </span>
          </div>
          <div className="space-y-4">
            {sessions.length > 0 ? sessions.map((session, idx) => (
              <div 
                key={idx} 
                className={`p-4 bg-gray-50/50 rounded-xl flex items-center gap-4 border transition-all duration-300 ${
                  (session as any).highlighted ? 'border-secondary shadow-md -translate-y-1' : 'border-transparent hover:border-emerald-900/10'
                }`}
              >
                <div className="text-center min-w-[64px] py-1.5 bg-emerald-600/5 rounded-lg flex flex-col items-center justify-center">
                  <span className="block text-sm font-bold text-emerald-700">{session.time}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-900/40 tracking-tighter">{session.duration}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-emerald-950">{session.student}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                      session.type === 'Individuel' ? 'bg-blue-100/50 text-blue-700' : 'bg-emerald-100/50 text-emerald-700'
                    }`}>
                      {session.type}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900/60 flex items-center gap-1 mt-1 font-medium">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {session.court}
                  </p>
                </div>
                {session.status === 'en attente' || session.status === 'demandée' ? (
                  <span className="material-symbols-outlined text-secondary animate-pulse">pending_actions</span>
                ) : (
                  <span className="material-symbols-outlined text-emerald-900/20">check_circle</span>
                )}
              </div>
            )) : (
              <div className="text-center py-10 bg-gray-50/30 rounded-xl border border-dashed border-emerald-900/10">
                <span className="material-symbols-outlined text-4xl text-emerald-900/20 mb-2">event_busy</span>
                <p className="text-sm font-medium text-emerald-900/40">Aucune session aujourd'hui</p>
              </div>
            )}
          </div>
          <button className="text-secondary font-headline text-sm font-bold text-center mt-2 hover:underline">
            Voir le planning complet
          </button>
        </section>

        {/* Court Status */}
        <section className="col-span-12 lg:col-span-7 bg-white rounded-xl p-8 shadow-ambient border border-emerald-900/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline text-xl font-bold text-emerald-950 tracking-tight">Disponibilité des Courts</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-900/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Libre
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-900/40">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Occupé
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {courts.length > 0 ? courts.map((court) => (
              <div 
                key={court.id} 
                className="bg-gray-50/50 p-6 rounded-xl flex flex-col items-center gap-3 relative group transition-all duration-300 border border-emerald-900/5 shadow-sm hover:shadow-md hover:border-emerald-600/20"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[0.2em]">{court.name}</span>
                  <span className="text-[9px] font-bold text-emerald-900/30 uppercase tracking-tighter">{court.type}</span>
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  court.status === 'disponible' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary/10 text-secondary'
                }`}>
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {court.status === 'disponible' ? 'check_circle' : 'person'}
                  </span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                  court.status === 'disponible' ? 'bg-emerald-500/5 text-emerald-700' : 'bg-secondary/5 text-secondary'
                }`}>
                  {court.status === 'disponible' ? 'Libre' : 'Occupé'}
                </span>
              </div>
            )) : (
              <div className="col-span-full text-center py-10 text-emerald-900/40">
                Chargement des courts...
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recent Students Footer */}
      <section className="col-span-12 bg-white rounded-xl p-8 shadow-ambient border border-emerald-900/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline text-xl font-bold text-emerald-950 tracking-tight">Dernières Activités Élèves</h3>
          <button className="text-secondary font-headline text-sm font-bold hover:underline font-black uppercase tracking-widest text-[10px]">Accéder à l'annuaire</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {recentStudents.length > 0 ? recentStudents.map((student, idx) => (
            <div key={idx} className="flex items-center gap-4 group cursor-pointer">
              <div className="relative">
                {student.img ? (
                  <img alt={student.name} className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-sm group-hover:ring-secondary/20 transition-all duration-300" src={student.img} />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black ring-4 ring-white shadow-sm group-hover:ring-secondary/20 transition-all">
                    {student.initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-emerald-950 group-hover:text-secondary transition-colors tracking-tight">{student.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30 mt-0.5">Dernier cours: {student.lastSession}</p>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-6 text-emerald-900/40 text-sm font-medium">
              Aucune activité récente trouvée
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
