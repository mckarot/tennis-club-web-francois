import type { MemberWithProfile } from "@/lib/types/dashboard";

interface RecentMembersProps {
  members: MemberWithProfile[];
}

export function RecentMembers({ members }: RecentMembersProps) {
  const getStatusBadge = (role: string) => {
    if (role === 'admin') {
      return 'bg-emerald-100 text-emerald-800';
    } else if (role === 'en_attente') {
      return 'bg-surface-container-highest text-outline';
    } else {
      return 'bg-surface-container-highest text-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
  };

  return (
    <section className="col-span-12 lg:col-span-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-primary">Membres Récents</h3>
        <button className="text-secondary text-xs font-bold hover:underline">Gérer</button>
      </div>
      <div className="space-y-1">
        {members.slice(0, 3).map((member) => (
          <div
            key={member.user}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-lg">person</span>
              </div>
              <div>
                <p className="text-sm font-bold">{member.prenom || 'Inconnu'} {member.nom || ''}</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                  Inscrit le {formatDate(member.created)}
                </p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(member.role)}`}>
              {member.role === 'admin' ? 'Admin' : 'Membre'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
