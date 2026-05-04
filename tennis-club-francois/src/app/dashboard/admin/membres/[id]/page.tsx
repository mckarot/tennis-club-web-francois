import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminMemberProfile } from './actions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'NC': { label: 'Non Classé', color: 'text-slate-600', bg: 'bg-slate-100' },
  'nc': { label: 'Non Classé', color: 'text-slate-600', bg: 'bg-slate-100' },
  'débutant': { label: 'Débutant', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  'beginner': { label: 'Débutant', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  'intermédiaire': { label: 'Intermédiaire', color: 'text-amber-700', bg: 'bg-amber-50' },
  'intermediate': { label: 'Intermédiaire', color: 'text-amber-700', bg: 'bg-amber-50' },
  'avancé': { label: 'Avancé', color: 'text-orange-700', bg: 'bg-orange-50' },
  'pro': { label: 'Expert', color: 'text-violet-700', bg: 'bg-violet-50' },
  'expert': { label: 'Expert', color: 'text-violet-700', bg: 'bg-violet-50' },
};

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'admin': { label: 'Administrateur', color: 'text-primary', bg: 'bg-primary/10' },
  'moniteur': { label: 'Moniteur', color: 'text-secondary', bg: 'bg-secondary/10' },
  'membre': { label: 'Membre', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  'cours_individuel': { label: 'Cours individuel', icon: 'person', color: 'text-emerald-700 bg-emerald-50' },
  'cours_collectif': { label: 'Cours collectif', icon: 'groups', color: 'text-blue-700 bg-blue-50' },
  'cours_stage': { label: 'Stage', icon: 'sports_tennis', color: 'text-violet-700 bg-violet-50' },
  'cours': { label: 'Cours', icon: 'sports_tennis', color: 'text-emerald-700 bg-emerald-50' },
  'libre': { label: 'Terrain libre', icon: 'grass', color: 'text-slate-600 bg-slate-100' },
};

function getResType(type: string, courseType?: string) {
  if (type === 'cours') {
    const key = `cours_${courseType || 'individuel'}`;
    return TYPE_CONFIG[key] ?? TYPE_CONFIG['cours'];
  }
  return TYPE_CONFIG['libre'];
}

export default async function AdminMemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let member: Awaited<ReturnType<typeof getAdminMemberProfile>>;
  try {
    member = await getAdminMemberProfile(id);
  } catch {
    notFound();
  }

  const levelConfig = LEVEL_CONFIG[member.level?.toLowerCase() ?? 'nc'] ?? LEVEL_CONFIG['nc'];
  const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG['membre'];
  const initials = `${member.prenom[0] ?? ''}${member.nom[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 font-body pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
        <Link href="/dashboard/admin/membres" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Gestion des Membres
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-on-surface font-bold">{member.prenom} {member.nom}</span>
      </div>

      {/* Hero Card */}
      <div className="relative bg-surface-container-lowest rounded-[2.5rem] shadow-xl border border-outline-variant/10 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-3xl overflow-hidden bg-secondary-container ring-4 ring-white shadow-xl flex items-center justify-center">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.nom} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-primary font-headline">{initials}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          </div>

          {/* Info principale */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
                {member.prenom} {member.nom}
              </h1>
              <span className={`${roleConfig.bg} ${roleConfig.color} px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-current/20`}>
                {roleConfig.label}
              </span>
              <span className={`${levelConfig.bg} ${levelConfig.color} px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest`}>
                {levelConfig.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-5 mt-3 text-sm text-on-surface-variant font-medium">
              {member.email && (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base opacity-50">mail</span>
                  {member.email}
                </span>
              )}
              {member.phone && (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base opacity-50">call</span>
                  {member.phone}
                </span>
              )}
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base opacity-50">calendar_month</span>
                Inscrit depuis {format(new Date(member.enrolledSince), 'MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>

          {/* Actions admin */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <button className="bg-primary text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md text-sm">
              <span className="material-symbols-outlined text-base">edit</span>
              Modifier le profil
            </button>
            <button className="bg-surface-container-high border border-outline-variant/30 text-error px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-error hover:text-white transition-all shadow-sm text-sm">
              <span className="material-symbols-outlined text-base">block</span>
              Suspendre
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 divide-x divide-outline-variant/10">
          {[
            { label: 'Réservations', value: member.stats.totalReservations, icon: 'event' },
            { label: 'Heures', value: `${member.stats.totalHours}h`, icon: 'schedule' },
            { label: 'Cours', value: member.stats.totalCours, icon: 'sports_tennis' },
            { label: 'Terrain libre', value: member.stats.totalLibre, icon: 'grass' },
            { label: 'À venir', value: member.stats.upcomingCount, icon: 'event_upcoming' },
            { label: 'Notes', value: member.stats.notesCount, icon: 'sticky_note_2' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-5 text-center">
              <span className="material-symbols-outlined text-2xl text-secondary mb-1 block">{icon}</span>
              <div className="font-headline text-2xl font-black text-primary">{value}</div>
              <div className="text-[10px] text-outline font-bold uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prochaines réservations */}
          {member.upcomingReservations.length > 0 && (
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/10 overflow-hidden">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="font-headline text-xl font-extrabold text-primary">Prochaines réservations</h2>
                <span className="w-6 h-6 bg-secondary rounded-full text-white text-xs font-black flex items-center justify-center">
                  {member.upcomingReservations.length}
                </span>
              </div>
              <div className="divide-y divide-outline-variant/5">
                {member.upcomingReservations.map((res) => {
                  const typeConf = getResType(res.type, res.courseType);
                  return (
                    <div key={res.id} className="px-8 py-5 flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/5 flex flex-col items-center justify-center text-primary">
                        <div className="font-black text-sm leading-none">{format(new Date(res.date), 'dd')}</div>
                        <div className="text-[10px] uppercase font-bold opacity-60">{format(new Date(res.date), 'MMM', { locale: fr })}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-on-surface text-sm">{format(new Date(res.date), 'HH:mm')} → {format(new Date(res.endTime), 'HH:mm')}</div>
                        <div className="text-xs text-outline mt-0.5">{res.courtName} · {res.courtType}</div>
                      </div>
                      <span className={`${typeConf.color} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-xs">{typeConf.icon}</span>
                        {typeConf.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historique */}
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/10">
              <h2 className="font-headline text-xl font-extrabold text-primary">Historique complet</h2>
              <p className="text-xs text-outline mt-1">{member.stats.totalReservations} réservations au total</p>
            </div>
            {member.pastReservations.length > 0 ? (
              <div className="divide-y divide-outline-variant/5">
                {member.pastReservations.map((res) => {
                  const typeConf = getResType(res.type, res.courseType);
                  return (
                    <div key={res.id} className="px-8 py-5 group hover:bg-surface-container-low/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-surface-container-high flex flex-col items-center justify-center text-on-surface-variant">
                          <div className="font-black text-sm leading-none">{format(new Date(res.date), 'dd')}</div>
                          <div className="text-[10px] uppercase font-bold opacity-60">{format(new Date(res.date), 'MMM', { locale: fr })}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-sm text-on-surface">
                              {format(new Date(res.date), 'HH:mm')} → {format(new Date(res.endTime), 'HH:mm')}
                            </span>
                            <span className={`${typeConf.color} px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1`}>
                              <span className="material-symbols-outlined text-xs">{typeConf.icon}</span>
                              {typeConf.label}
                            </span>
                          </div>
                          <div className="text-xs text-outline mt-1 flex items-center gap-3">
                            <span>{res.courtName} · {res.courtType}</span>
                            {res.moniteurName && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">person</span>{res.moniteurName}</span>}
                          </div>
                          {res.notes && (
                            <div className="mt-2 text-xs text-on-surface-variant italic bg-surface-container-low px-3 py-2 rounded-xl">
                              💬 {res.notes}
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                          res.status === 'confirmée' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-container-high text-outline'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-outline font-bold italic">
                Aucune réservation passée pour ce membre.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar droite */}
        <div className="space-y-6">
          {/* Fiche membre */}
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="px-7 py-6 border-b border-outline-variant/10">
              <h2 className="font-headline text-lg font-extrabold text-primary">Fiche membre</h2>
            </div>
            <div className="px-7 py-6 space-y-5">
              {[
                { label: 'Niveau tennis', value: levelConfig.label, icon: 'emoji_events' },
                { label: 'Abonnement', value: member.typeAbonnement, icon: 'card_membership' },
                { label: 'Statut', value: member.statutAdhesion, icon: 'verified_user' },
                { label: 'Rôle', value: roleConfig.label, icon: 'manage_accounts' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-wider text-outline">{label}</div>
                    <div className="text-sm font-bold text-on-surface capitalize">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes des moniteurs */}
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="px-7 py-6 border-b border-outline-variant/10">
              <h2 className="font-headline text-lg font-extrabold text-primary">Notes des moniteurs</h2>
              <p className="text-xs text-outline mt-0.5">{member.stats.notesCount} note(s) enregistrée(s)</p>
            </div>
            <div className="px-7 py-6">
              {member.notes.length > 0 ? (
                <div className="space-y-4">
                  {member.notes.slice(0, 5).map((note) => (
                    <div key={note.id} className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black text-secondary">{note.moniteurName}</span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`material-symbols-outlined text-sm ${star <= note.rating ? 'text-amber-400' : 'text-outline-variant'}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-outline font-medium">
                          {format(new Date(note.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {member.notes.length > 5 && (
                    <p className="text-center text-xs font-bold text-secondary">
                      + {member.notes.length - 5} autres notes
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">sticky_note_2</span>
                  <p className="text-xs text-outline font-medium">Aucune note de moniteur</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
