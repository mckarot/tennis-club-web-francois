import React from 'react';
import Link from 'next/link';
import { getMoniteurStudentsData, StudentData } from './actions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default async function MoniteurElevesPage() {
  let students: StudentData[] = [];
  let totalActive = 0;

  try {
    const data = await getMoniteurStudentsData();
    students = data.students;
    totalActive = data.totalActive;
  } catch (error) {
    console.error('Failed to load students:', error);
  }

  const getLevelColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
      case 'débutant':
      case 'nc':
        return 'bg-surface-container-highest text-on-surface-variant';
      case 'intermediate':
      case 'intermédiaire':
        return 'bg-secondary-container/20 text-on-secondary-container';
      case 'pro':
      case 'expert':
        return 'bg-primary-container/10 text-primary-container';
      default:
        return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-body overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight leading-none">Gestion des Élèves</h2>
          <p className="text-secondary mt-3 font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            {totalActive} Élèves Actifs cette saison
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 group shadow-lg">
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">person_add</span>
            <span>Ajouter un élève</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-emerald-900/5 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[320px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40">search</span>
          <input 
            className="w-full bg-white border border-emerald-900/5 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-all outline-none" 
            placeholder="Rechercher par nom, niveau ou email..." 
            type="text"
          />
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-emerald-900/5 px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span>Filtrer</span>
          </button>
          <button className="bg-white border border-emerald-900/5 px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">sort</span>
            <span>Trier</span>
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl shadow-ambient border border-emerald-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-emerald-900/[0.02] text-emerald-900/40 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-10 py-6 border-b border-emerald-900/5">Élève</th>
                <th className="px-8 py-6 border-b border-emerald-900/5">Niveau</th>
                <th className="px-8 py-6 border-b border-emerald-900/5">Dernière Leçon</th>
                <th className="px-8 py-6 border-b border-emerald-900/5">Contact</th>
                <th className="px-10 py-6 border-b border-emerald-900/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {students.length > 0 ? students.map((student) => (
                <tr key={student.id} className="hover:bg-emerald-50/50 transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-emerald-100 ring-2 ring-emerald-900/5 group-hover:ring-secondary/50 transition-all shadow-sm">
                        {student.avatarUrl ? (
                          <img className="w-full h-full object-cover" src={student.avatarUrl} alt={student.nom} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-900 font-bold text-lg">
                            {student.prenom[0]}{student.nom[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-headline font-bold text-lg text-emerald-950 group-hover:text-secondary transition-colors truncate">
                          {student.prenom} {student.nom}
                        </div>
                        <div className="text-xs text-emerald-900/40 font-medium mt-1 uppercase tracking-wider">
                          Inscrit depuis {format(new Date(student.enrolledSince), 'MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={`${getLevelColor(student.level)} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                      {student.level || 'NC'}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    {student.lastLesson ? (
                      <div>
                        <div className="text-sm font-bold text-emerald-950">
                          {format(student.lastLesson.date, 'dd MMM yyyy', { locale: fr })}
                        </div>
                        <div className="text-[10px] text-emerald-900/40 font-medium uppercase tracking-widest mt-1 flex items-center gap-1">
                           <span className="material-symbols-outlined text-[12px]">location_on</span>
                           {student.lastLesson.courtName} - {format(student.lastLesson.date, 'HH:mm')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-900/20 italic">Aucun cours</span>
                    )}
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-2">
                      <div className="text-xs flex items-center gap-2 font-bold text-emerald-950/70 hover:text-secondary transition-colors truncate">
                        <span className="material-symbols-outlined text-sm opacity-40">mail</span>
                        {student.email}
                      </div>
                      {student.phone && (
                        <div className="text-xs flex items-center gap-2 font-bold text-emerald-950/70">
                          <span className="material-symbols-outlined text-sm opacity-40">call</span>
                          {student.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                      <button className="w-10 h-10 flex items-center justify-center text-primary bg-primary/5 hover:bg-secondary hover:text-white rounded-full transition-all shadow-sm" title="Envoyer un message">
                        <span className="material-symbols-outlined text-lg">send</span>
                      </button>
                      <Link
                        href={`/dashboard/moniteur/eleves/${student.id}`}
                        className="bg-emerald-900/5 text-emerald-950 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        Voir profil
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-emerald-900/20 font-bold italic">
                    Aucun élève trouvé pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="px-10 py-8 bg-emerald-900/[0.02] flex items-center justify-between border-t border-emerald-900/5">
          <p className="text-xs font-bold text-emerald-900/40 uppercase tracking-widest">Affichage de {students.length} sur {totalActive} élèves</p>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-900/5 bg-white text-emerald-900/20 hover:text-secondary hover:border-secondary/30 transition-all disabled:opacity-10 cursor-not-allowed shadow-sm" disabled>
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary text-white text-xs font-black shadow-lg shadow-secondary/20">1</button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-emerald-900/5 text-xs font-bold text-emerald-950/60 hover:text-secondary hover:border-secondary transition-all shadow-sm">2</button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-emerald-900/5 text-xs font-bold text-emerald-950/60 hover:text-secondary hover:border-secondary transition-all shadow-sm">3</button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-emerald-900/5 text-emerald-950/40 hover:text-secondary hover:border-secondary transition-all shadow-sm">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
