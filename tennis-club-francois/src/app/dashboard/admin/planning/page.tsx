import { createClient } from '@/lib/pocketbase/server';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/dashboard/admin/AdminHeader';
import { WeatherWidget } from '@/components/dashboard/admin/planning/WeatherWidget';
import { PlanningGrid } from '@/components/dashboard/admin/planning/PlanningGrid';
import { getPlanningData } from './actions';
import { format } from 'date-fns';

/**
 * Page Planning - Dashboard Admin
 * Vue calendrier interactive des 6 courts
 */
export default async function AdminPlanningPage() {
  const pb = await createClient();

  // 1. Vérification session + rôle admin (Security First)
  if (!pb.authStore.isValid) {
    redirect('/login');
  }

  const user = pb.authStore.model;
  if (!user) {
    redirect('/login');
  }

  let profile;
  try {
    profile = await pb.collection('profiles')
      .getFirstListItem(`user="${user.id}"`);
  } catch (err) {
    console.error('Erreur récupération profil:', err);
    redirect('/dashboard/membre');
  }

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard/membre');
  }

  // 2. Pré-chargement des données pour le SSR
  const today = new Date().toISOString().split('T')[0];
  const initialPlanningData = await getPlanningData(today);

  return (
    <>
      <AdminHeader 
        title="Planning des Courts" 
        subtitle="Vue d'ensemble des réservations et disponibilités en temps réel"
      />

      <div className="pb-12">
        {/* Bento Header */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-secondary font-headline text-xs font-bold tracking-[0.2em] uppercase mb-3 text-glow-orange/20">
              Gestion de l'établissement
            </h2>
            <h1 className="text-4xl md:text-5xl font-headline font-black text-primary tracking-tighter leading-[0.9] mb-4">
              Le cœur du club.
            </h1>
            <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed font-medium opacity-80">
              Pilotez l'activité des 6 courts avec une précision absolue. 
              Gérez les réservations, bloquez les maintenances et assurez une expérience membre fluide.
            </p>
          </div>
          
          <WeatherWidget />
        </header>

        {/* Grille Interactive (Main Content) */}
        <PlanningGrid initialData={initialPlanningData} />
      </div>
    </>
  );
}
