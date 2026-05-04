'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/(auth)/actions';
import { getMoniteurDashboardData } from './actions';

export default function MoniteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ fullName: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMoniteurDashboardData();
        setProfile(data.profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await logoutAction();
  };

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard/moniteur' },
    { name: 'Planning', icon: 'calendar_today', href: '/dashboard/moniteur/planning' },
    { name: 'Élèves', icon: 'group', href: '/dashboard/moniteur/eleves' },
    { name: 'Paramètres', icon: 'settings', href: '/dashboard/moniteur/parametres' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] text-emerald-950 font-body">
      {/* Sidebar: SideNavBar */}
      <aside className="bg-emerald-950 h-screen w-64 rounded-r-[3rem] fixed left-0 top-0 z-40 shadow-ambient hidden md:flex flex-col py-8 font-headline tracking-tighter">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-emerald-50">Club François</h1>
          <p className="text-emerald-100/50 text-[10px] font-black uppercase tracking-widest mt-1">Espace Moniteur</p>
        </div>
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 transition-all duration-300 ${
                  isActive 
                    ? 'bg-secondary/10 text-secondary font-semibold rounded-l-none rounded-r-full mr-4 scale-95' 
                    : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/50'
                }`}
              >
                <span className={`material-symbols-outlined mr-4 ${isActive ? 'fill-1' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 mt-auto space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-emerald-100/40 hover:text-white font-headline text-sm font-bold transition-colors text-left group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500">logout</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 relative min-h-screen">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-20 z-30 bg-white/60 backdrop-blur-xl border-b border-emerald-900/5 flex items-center px-12 font-headline font-medium text-emerald-950 justify-end">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <span className="material-symbols-outlined text-emerald-900/40 hover:text-emerald-900 transition-colors">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-3 bg-emerald-900/5 pl-2 pr-4 py-1.5 rounded-full cursor-pointer hover:bg-emerald-900/10 transition-all border border-emerald-900/5">
              {profile?.avatarUrl ? (
                <img 
                  alt="Moniteur Avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-white" 
                  src={profile.avatarUrl}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-50 text-[10px] font-bold">
                  {profile?.fullName.split(' ').map(n => n[0]).join('') || 'Coach'}
                </div>
              )}
              <span className="text-sm font-bold max-md:hidden">{profile?.fullName || 'Chargement...'}</span>
            </div>
          </div>
        </header>

        <div className="pt-28 pb-12 px-6 md:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
