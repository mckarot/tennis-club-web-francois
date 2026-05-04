import { createClient } from '@/lib/pocketbase/server';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/dashboard/admin/AdminHeader';

/**
 * Page Paramètres - Dashboard Admin
 * Configuration du club
 */
export default async function AdminSettingsPage() {
  const pb = await createClient();

  // Vérification session + rôle admin
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

  return (
    <>
      <AdminHeader 
        title="Paramètres du Club" 
        subtitle="Configurez les options générales du club"
      />

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-8">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">settings</span>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
            Page Paramètres en construction
          </h2>
          <p className="font-body text-on-surface-variant max-w-md mx-auto">
            Cette fonctionnalité sera bientôt disponible pour configurer les horaires, tarifs et options du club.
          </p>
        </div>
      </div>
    </>
  );
}
