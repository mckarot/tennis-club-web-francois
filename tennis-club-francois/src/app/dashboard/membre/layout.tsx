'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/app/(auth)/actions';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
  };

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard/membre' },
    { name: 'Planning', icon: 'calendar_month', href: '/dashboard/membre/planning' },
    { name: 'Mes Réservations', icon: 'sports_tennis', href: '/dashboard/membre/mes-reservations' },
    { name: 'Paramètres', icon: 'settings', href: '/dashboard/membre/parametres' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f9faf8] text-[#191c1b] font-body">
      {/* Sidebar: SideNavBar */}
      <aside className="hidden md:flex flex-col py-8 px-4 bg-[#064e3b] h-screen w-64 fixed left-0 top-0 rounded-r-[3rem] shadow-2xl z-50 overflow-y-auto border-none">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-headline font-black text-white tracking-tighter">Club François</h1>
          <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Espace Membre</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-4 mx-2 rounded-full font-headline text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#f97316] text-white shadow-lg translate-x-2' 
                    : 'text-emerald-100/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-1' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 px-2 space-y-2 border-t border-white/10">

          
          <Link href="/aide" className="flex items-center gap-3 px-6 py-3 mx-2 text-emerald-100/60 hover:text-white font-headline text-sm font-bold transition-colors">
            <span className="material-symbols-outlined text-[20px]">help</span>
            Aide
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 mx-2 text-emerald-100/60 hover:text-white font-headline text-sm font-bold transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 relative bg-[#f9faf8] min-h-screen">
        <div className="min-h-[calc(100vh-20rem)] pb-20">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="mt-20 py-12 px-8 bg-[#f3f4f2] rounded-t-[3rem] w-full border-t border-[#c1c8c4]/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-screen-2xl mx-auto">
            <div className="col-span-1 md:col-span-2">
              <h5 className="font-headline font-black text-[#01261f] text-2xl mb-6 tracking-tighter">Tennis Club du François</h5>
              <p className="font-manrope text-xs font-bold uppercase tracking-widest text-[#414846]/60 max-w-sm leading-relaxed">
                Le prestige du sport rencontre l'élégance tropicale au cœur de la Martinique. Excellence, Passion et Communauté depuis 1985.
              </p>
            </div>
            <div>
              <h6 className="font-headline font-black text-[#01261f] mb-4 text-sm uppercase tracking-widest">Navigation</h6>
              <ul className="space-y-3 font-manrope text-xs font-bold text-[#414846]/60 uppercase tracking-tighter">
                <li><Link className="hover:text-[#f97316] transition-colors" href="/dashboard/membre/planning">Réserver un court</Link></li>
                <li><Link className="hover:text-[#f97316] transition-colors" href="/dashboard/membre/coachs">Cours & Moniteurs</Link></li>
                <li><Link className="hover:text-[#f97316] transition-colors" href="/le-club">Le Club</Link></li>
                <li><Link className="hover:text-[#f97316] transition-colors" href="/evenements">Événements</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-headline font-black text-[#01261f] mb-4 text-sm uppercase tracking-widest">Légal</h6>
              <ul className="space-y-3 font-manrope text-xs font-bold text-[#414846]/60 uppercase tracking-tighter">
                <li><Link className="hover:text-[#f97316] transition-colors" href="/mentions-legales">Mentions Légales</Link></li>
                <li><Link className="hover:text-[#f97316] transition-colors" href="/cgu">Conditions d'Utilisation</Link></li>
                <li><Link className="hover:text-[#f97316] transition-colors" href="/confidentialite">Confidentialité</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[#c1c8c4]/10 flex flex-col md:flex-row justify-between items-center gap-4 max-w-screen-2xl mx-auto">
            <p className="font-manrope text-[10px] font-black uppercase tracking-[0.2em] text-[#414846]/40">© 2024 Club de Tennis du François - Martinique</p>
            <div className="flex gap-6">
              <Link className="text-[#414846]/40 hover:text-[#01261f] transition-colors" href="#"><span className="material-symbols-outlined">social_leaderboard</span></Link>
              <Link className="text-[#414846]/40 hover:text-[#01261f] transition-colors" href="#"><span className="material-symbols-outlined">photo_camera</span></Link>
            </div>
          </div>
        </footer>
        
        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#064e3b]/95 backdrop-blur-xl text-white flex justify-around items-center h-20 z-50 px-4 rounded-t-[2rem] shadow-2xl border-t border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#f97316]' : 'text-emerald-100/50'}`}
              >
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.name === 'Mes Réservations' ? 'Matchs' : item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
