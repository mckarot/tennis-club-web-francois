import { createClient } from '@/lib/pocketbase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { SidebarNav } from '@/components/dashboard/admin/SidebarNav';
import { PageTransition } from '@/components/dashboard/PageTransition';

/**
 * Layout Dashboard Admin avec Sidebar Stitch
 * 
 * Security:
 * - Session vérifiée via PocketBase
 * - Rôle admin requis → redirection si rôle insuffisant
 * - Sidebar fixe à gauche (w-72, bg-emerald-950)
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pb = await createClient();

  // Récupération de l'utilisateur
  if (!pb.authStore.isValid) {
    redirect('/login');
  }

  const user = pb.authStore.model;

  if (!user) {
    redirect('/login');
  }

  // Vérification du rôle admin
  let profile;
  try {
    profile = await pb.collection('profiles')
      .getFirstListItem(`user="${user.id}"`);
  } catch (err) {
    console.error('Erreur récupération profil:', err);
    redirect('/dashboard/membre');
  }

  // Redirection si rôle ≠ admin
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard/membre');
  }

  const nomComplet = `${profile.prenom || ''} ${profile.nom || ''}`.trim() || user.email?.split('@')[0] || 'Admin';
  
  // Construction de l'URL complète pour PocketBase
  const pbUrl = process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL || '';
  const avatarUrl = profile.avatar_url 
    ? `${pbUrl}/api/files/${profile.collectionId}/${profile.id}/${profile.avatar_url}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(nomComplet)}&background=01261f&color=fff&size=128`;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar - Design System Stitch */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-emerald-950 flex flex-col shadow-[0_20px_50px_rgba(25,28,27,0.06)] z-50 rounded-r-[3rem] overflow-hidden">
        {/* En-tête Logo */}
        <div className="px-6 py-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-on-primary text-xl">sports_tennis</span>
            </div>
            <div>
              <h1 className="font-headline text-lg font-bold text-white tracking-tight">
                Tennis Club
              </h1>
              <p className="text-xs text-primary-fixed font-body font-body font-medium">
                ADMINISTRATION CLUB
              </p>
            </div>
          </div>
        </div>

        {/* Menu Principal (Client Side for Active Links) */}
        <SidebarNav />

        {/* Section Profil (en bas) */}
        <div className="px-4 py-6 border-t border-white/10 space-y-4">
          {/* Avatar + Nom + Badge */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-md flex-shrink-0 relative">
              <Image
                className="w-full h-full object-cover"
                src={avatarUrl}
                alt={nomComplet}
                width={40}
                height={40}
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold text-primary-fixed truncate">
                {nomComplet}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-container text-[10px] font-bold text-primary-fixed uppercase tracking-wide">
                ADMIN
              </span>
            </div>
          </div>

        </div>
      </aside>

      {/* Contenu Principal */}
      <main className="ml-72 flex-1 p-8 min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
