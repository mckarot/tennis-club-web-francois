import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudentProfile } from './actions';
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

const COURSE_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  'individuel': { label: 'Individuel', icon: 'person', color: 'text-emerald-700 bg-emerald-50' },
  'collectif': { label: 'Collectif', icon: 'groups', color: 'text-blue-700 bg-blue-50' },
  'stage': { label: 'Stage', icon: 'sports_tennis', color: 'text-violet-700 bg-violet-50' },
};

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let student: Awaited<ReturnType<typeof getStudentProfile>>;
  try {
    student = await getStudentProfile(id);
  } catch {
    notFound();
  }

  const levelConfig = LEVEL_CONFIG[student.level?.toLowerCase() ?? 'nc'] ?? LEVEL_CONFIG['nc'];
  const initials = `${student.prenom[0] ?? ''}${student.nom[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-body pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-emerald-900/40 font-medium">
        <Link href="/dashboard/moniteur/eleves" className="hover:text-secondary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Mes Élèves
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-emerald-950 font-bold">{student.prenom} {student.nom}</span>
      </div>

      {/* Hero Card */}
      <div className="relative bg-white rounded-3xl shadow-ambient border border-emerald-900/5 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-emerald-100 ring-4 ring-white shadow-xl">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.nom} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-emerald-900 font-black text-3xl font-headline">
                  {initials}
                </div>
              )}
            </div>
            {/* Status dot */}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" title="Actif" />
          </div>

          {/* Info principale */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-headline text-4xl font-extrabold text-emerald-950 tracking-tight">
                {student.prenom} {student.nom}
              </h1>
              <span className={`${levelConfig.bg} ${levelConfig.color} px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest`}>
                {levelConfig.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-5 mt-3 text-sm text-emerald-900/60 font-medium">
              {student.email && (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base opacity-50">mail</span>
                  {student.email}
                </span>
              )}
              {student.phone && (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base opacity-50">call</span>
                  {student.phone}
                </span>
              )}
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base opacity-50">calendar_month</span>
                Inscrit depuis {format(new Date(student.enrolledSince), 'MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link
              href={`/dashboard/moniteur/planning`}
              className="bg-emerald-950 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-emerald-900 transition-all shadow-md text-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Ajouter un cours
            </Link>
            <Link
              href={`/dashboard/moniteur/notes?student=${student.id}`}
              className="bg-white border border-emerald-900/10 text-emerald-950 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm text-sm"
            >
              <span className="material-symbols-outlined text-base">sticky_note_2</span>
              Carnet de suivi
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative border-t border-emerald-900/5 grid grid-cols-2 md:grid-cols-4 divide-x divide-emerald-900/5">
          {[
            { label: 'Cours effectués', value: student.stats.totalCourses, icon: 'sports_tennis' },
            { label: 'Heures de cours', value: `${student.stats.totalHours}h`, icon: 'schedule' },
            { label: 'Cours à venir', value: student.stats.upcomingCount, icon: 'event_upcoming' },
            { label: 'Notes', value: student.notes.length, icon: 'sticky_note_2' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-6 text-center">
              <span className="material-symbols-outlined text-2xl text-secondary mb-2 block">{icon}</span>
              <div className="font-headline text-3xl font-black text-emerald-950">{value}</div>
              <div className="text-xs text-emerald-900/40 font-bold uppercase tracking-wider mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cours à venir */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prochains cours */}
          {student.upcomingCourses.length > 0 && (
            <div className="bg-white rounded-3xl shadow-ambient border border-emerald-900/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-emerald-900/5 flex items-center justify-between">
                <h2 className="font-headline text-xl font-extrabold text-emerald-950">Prochains cours</h2>
                <span className="w-6 h-6 bg-emerald-500 rounded-full text-white text-xs font-black flex items-center justify-center">
                  {student.upcomingCourses.length}
                </span>
              </div>
              <div className="divide-y divide-emerald-900/5">
                {student.upcomingCourses.map((course) => {
                  const typeConf = COURSE_TYPE_CONFIG[course.courseType] ?? COURSE_TYPE_CONFIG['individuel'];
                  return (
                    <div key={course.id} className="px-8 py-5 flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 flex flex-col items-center justify-center text-emerald-900">
                        <div className="font-black text-sm leading-none">{format(new Date(course.date), 'dd')}</div>
                        <div className="text-[10px] uppercase font-bold opacity-60">{format(new Date(course.date), 'MMM', { locale: fr })}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-emerald-950 text-sm">{format(new Date(course.date), 'HH:mm')} → {format(new Date(course.endTime), 'HH:mm')}</div>
                        <div className="text-xs text-emerald-900/40 mt-0.5">{course.courtName}</div>
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

          {/* Historique des cours */}
          <div className="bg-white rounded-3xl shadow-ambient border border-emerald-900/5 overflow-hidden">
            <div className="px-8 py-6 border-b border-emerald-900/5">
              <h2 className="font-headline text-xl font-extrabold text-emerald-950">Historique des cours</h2>
              <p className="text-xs text-emerald-900/40 mt-1">{student.stats.totalCourses} séances avec vous</p>
            </div>
            {student.pastCourses.length > 0 ? (
              <div className="divide-y divide-emerald-900/5">
                {student.pastCourses.map((course) => {
                  const typeConf = COURSE_TYPE_CONFIG[course.courseType] ?? COURSE_TYPE_CONFIG['individuel'];
                  return (
                    <div key={course.id} className="px-8 py-5 group hover:bg-emerald-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-900/5 flex flex-col items-center justify-center text-emerald-900">
                          <div className="font-black text-sm leading-none">{format(new Date(course.date), 'dd')}</div>
                          <div className="text-[10px] uppercase font-bold opacity-60">{format(new Date(course.date), 'MMM', { locale: fr })}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-sm text-emerald-950">
                              {format(new Date(course.date), 'HH:mm')} → {format(new Date(course.endTime), 'HH:mm')}
                            </span>
                            <span className={`${typeConf.color} px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                              {typeConf.label}
                            </span>
                          </div>
                          <div className="text-xs text-emerald-900/40 mt-1">{course.courtName}</div>
                          {course.notes && (
                            <div className="mt-2 text-xs text-emerald-900/60 italic bg-emerald-50 px-3 py-2 rounded-xl">
                              💬 {course.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-emerald-900/20 font-bold italic">
                Aucun cours passé avec cet élève pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar droite */}
        <div className="space-y-6">
          {/* Infos membre */}
          <div className="bg-white rounded-3xl shadow-ambient border border-emerald-900/5 overflow-hidden">
            <div className="px-7 py-6 border-b border-emerald-900/5">
              <h2 className="font-headline text-lg font-extrabold text-emerald-950">Fiche membre</h2>
            </div>
            <div className="px-7 py-6 space-y-4">
              {[
                { label: 'Niveau', value: levelConfig.label, icon: 'emoji_events' },
                { label: 'Abonnement', value: student.typeAbonnement, icon: 'card_membership' },
                { label: 'Statut', value: student.statutAdhesion, icon: 'verified_user' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-wider text-emerald-900/30">{label}</div>
                    <div className="text-sm font-bold text-emerald-950 capitalize">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dernières notes */}
          <div className="bg-white rounded-3xl shadow-ambient border border-emerald-900/5 overflow-hidden">
            <div className="px-7 py-6 border-b border-emerald-900/5 flex items-center justify-between">
              <h2 className="font-headline text-lg font-extrabold text-emerald-950">Carnet de suivi</h2>
              <Link
                href={`/dashboard/moniteur/notes?student=${student.id}`}
                className="text-xs font-bold text-secondary hover:underline"
              >
                Tout voir
              </Link>
            </div>
            <div className="px-7 py-6">
              {student.notes.length > 0 ? (
                <div className="space-y-4">
                  {student.notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-900/5">
                      <p className="text-sm text-emerald-950 leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`material-symbols-outlined text-sm ${star <= note.rating ? 'text-amber-400' : 'text-emerald-900/10'}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-emerald-900/30 font-medium">
                          {format(new Date(note.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {student.notes.length > 3 && (
                    <Link
                      href={`/dashboard/moniteur/notes?student=${student.id}`}
                      className="block text-center text-xs font-bold text-secondary hover:underline mt-2"
                    >
                      + {student.notes.length - 3} autres notes
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-emerald-900/10 mb-2 block">sticky_note_2</span>
                  <p className="text-xs text-emerald-900/30 font-medium">Aucune note pour cet élève</p>
                  <Link
                    href={`/dashboard/moniteur/notes?student=${student.id}`}
                    className="inline-block mt-3 text-xs font-bold text-secondary hover:underline"
                  >
                    Ajouter une note
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
