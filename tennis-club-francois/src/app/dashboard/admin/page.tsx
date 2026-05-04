import { getAdminDashboardData } from '@/app/dashboard/actions';
import { CourtsOverview } from '@/components/dashboard/admin/CourtsOverview';
import { RecentReservations } from '@/components/dashboard/admin/RecentReservations';
import { RecentMembers } from '@/components/dashboard/admin/RecentMembers';
import { QuickActions } from '@/components/dashboard/admin/QuickActions';
import { AdminHeader } from '@/components/dashboard/admin/AdminHeader';

export default async function AdminDashboardPage() {
  console.log('[Client Page] Début du rendu de AdminDashboardPage.');

  const result = await getAdminDashboardData();
  
  if (!result.success) {
    // ... error handling ...
    return (
      <div className="pr-12 pt-8 pb-20">
        <div className="bg-error-container border border-error/50 rounded-2xl p-6">
          <h3 className="font-bold text-error mb-2">Erreur de chargement du tableau de bord</h3>
          <p className="text-error font-semibold">{result.error}</p>
        </div>
      </div>
    );
  }

  const data = result.data;
  const formattedDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <AdminHeader 
        title={`Bonjour, ${data.adminProfile.fullName}`} 
        subtitle={`Club du François, Martinique • ${formattedDate}`}
        adminProfile={data.adminProfile}
      />

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Actions Rapides + État des Courts */}
        <div className="col-span-12 grid grid-cols-12 gap-6">
          <QuickActions />
          <CourtsOverview courts={data.courts} />
        </div>

        {/* Dernières Réservations */}
        <RecentReservations reservations={data.dernieresReservations} />

        {/* Membres Récents */}
        <RecentMembers members={data.membresRecents} />
      </div>
    </>
  );
}
