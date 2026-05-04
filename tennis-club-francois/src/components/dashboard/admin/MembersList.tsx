'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMembersAction } from '@/app/dashboard/actions';
import type { MemberWithProfile } from '@/lib/types/dashboard';

/**
 * MembersList - Gestionnaire complet des membres côté Admin
 * Affiche la liste des membres avec recherche, filtrage et statistiques.
 */
export function MembersList({ initialMembers, totalCount }: { initialMembers: MemberWithProfile[], totalCount: number }) {
  const [members, setMembers] = useState<MemberWithProfile[]>(initialMembers);
  const [total, setTotal] = useState(totalCount);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  // Rafraîchir les données quand les filtres changent
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const result = await getMembersAction({ search, role, limit: 50, offset: 0 });
      if (result.success) {
        setMembers(result.data.members);
        setTotal(result.data.total);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, role]);

  const activeMembersCount = members.filter(m => m.statut_adhesion !== 'suspendu').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Zone Statistiques et Recherche */}
      <div className="grid grid-cols-12 gap-6">
        {/* Carte Statistique - Total Actif (Style Stitch Premium) */}
        <div className="col-span-12 md:col-span-4 bg-primary text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-wider">Total Actifs</p>
            <h4 className="text-5xl font-black">{total}</h4>
            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/20 w-fit rounded-full">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              <span className="text-[10px] font-bold uppercase">Membres Certifiés</span>
            </div>
          </div>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/20 flex flex-col justify-center gap-4 shadow-sm">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Rechercher un membre par nom ou email..."
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Tous les rôles</option>
              <option value="membre">Membre</option>
              <option value="moniteur">Moniteur</option>
              <option value="admin">Administrateur</option>
            </select>
            <div className="flex-1" />
            <p className="text-xs text-on-surface-variant font-medium self-center">
              {loading ? 'Chargement...' : `${total} membre(s) trouvé(s)`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Table des Membres */}
      <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50 text-[11px] uppercase tracking-widest font-black text-outline">
              <th className="py-6 px-8 border-b border-outline-variant/20">Membre</th>
              <th className="py-6 px-4 border-b border-outline-variant/20">Rôle</th>
              <th className="py-6 px-4 border-b border-outline-variant/20">Contact</th>
              <th className="py-6 px-4 border-b border-outline-variant/20">Inscription</th>
              <th className="py-6 px-8 border-b border-outline-variant/20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.user} className="group hover:bg-surface-container-low/30 transition-all duration-300">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      {/* Avatar avec icône par défaut si pas d'image */}
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-white flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                        {member.user && member.user.length > 0 ? (
                           // On tente d'utiliser une photo générée ou par défaut
                           // Si pas d'avatar_url, on met l'icône
                           <div className="w-full h-full bg-secondary-container flex items-center justify-center">
                             <span className="material-symbols-outlined text-secondary text-2xl">account_circle</span>
                           </div>
                        ) : (
                          <div className="w-full h-full bg-secondary-container flex items-center justify-center">
                             <span className="material-symbols-outlined text-secondary text-2xl">person</span>
                           </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary group-hover:text-secondary transition-colors uppercase tracking-tight">
                          {member.prenom} {member.nom}
                        </span>
                        <span className="text-[10px] text-outline font-bold truncate max-w-[150px]">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                      member.role === 'admin' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : member.role === 'moniteur'
                        ? 'bg-secondary/10 text-secondary border border-secondary/20'
                        : 'bg-surface-container-highest text-outline border border-outline-variant/30'
                    }`}>
                      {member.role === 'admin' ? 'Administrateur' : member.role === 'moniteur' ? 'Moniteur' : 'Membre'}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">phone</span>
                        {member.telephone || 'Non renseigné'}
                      </span>
                      <span className="text-[10px] font-medium text-outline uppercase">
                        {member.niveau_tennis || 'Niveau inconnu'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {new Date(member.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                      <Link
                        href={`/dashboard/admin/membres/${member.user}`}
                        className="h-9 px-4 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center gap-1.5 text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm text-[11px] font-black uppercase tracking-wide"
                      >
                        <span className="material-symbols-outlined text-[16px]">account_circle</span>
                        Voir profil
                      </Link>
                      <button className="h-9 w-9 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="h-9 w-9 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-error hover:bg-error hover:text-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">person_search</span>
                  <p className="text-on-surface-variant font-medium">Aucun membre ne correspond à votre recherche</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination simplifiée (Visuelle uniquement pour l'instant) */}
      <div className="flex justify-between items-center py-4 px-2">
        <p className="text-xs text-outline font-medium uppercase tracking-widest">Page 1 sur 1</p>
        <div className="flex gap-2">
          <button disabled className="h-10 px-4 rounded-xl border border-outline-variant/20 text-xs font-bold opacity-30 text-outline">Précédent</button>
          <button disabled className="h-10 px-4 rounded-xl border border-outline-variant/20 text-xs font-bold opacity-30 text-outline">Suivant</button>
        </div>
      </div>
    </div>
  );
}
