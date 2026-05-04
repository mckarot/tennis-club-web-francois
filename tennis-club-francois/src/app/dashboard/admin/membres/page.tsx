import { getMembersAction } from '@/app/dashboard/actions';
import { MembersList } from '@/components/dashboard/admin/MembersList';
import { AdminHeader } from '@/components/dashboard/admin/AdminHeader';

/**
 * Page Gestion des Membres (Admin)
 */
export default async function AdminMembersPage() {
  console.log('[AdminMembersPage] Récupération de la liste initiale des membres.');

  const result = await getMembersAction({ limit: 50, offset: 0 });

  if (!result.success) {
    // ... error handling ...
    return (
      <div className="bg-error-container border border-error/50 rounded-2xl p-6">
        <h3 className="font-bold text-error mb-2">Erreur de chargement des membres</h3>
        <p className="text-error font-semibold">{result.error}</p>
      </div>
    );
  }

  const { members, total } = result.data;

  return (
    <>
      <AdminHeader 
        title="Gestion des Membres" 
        subtitle="Gérez les inscriptions, les rôles et les profils de votre club."
      />

      {/* Liste des Membres avec Recherche et Stats */}
      <MembersList initialMembers={members} totalCount={total} />
    </>
  );
}
