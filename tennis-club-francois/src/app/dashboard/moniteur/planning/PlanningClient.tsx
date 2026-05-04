'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AddCourseModal from './AddCourseModal';

interface PlanningClientProps {
  planningData: any;
  students: any[];
  mondayParam?: string;
  prevWeekStr: string;
  nextWeekStr: string;
  formatMonthRange: string;
  weekDays: { date: Date; name: string; isToday: boolean }[];
}

export default function PlanningClient({
  planningData,
  students,
  mondayParam,
  prevWeekStr,
  nextWeekStr,
  formatMonthRange,
  weekDays: initialWeekDays
}: PlanningClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle auto-open modal from query param
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsModalOpen(true);
      // Optional: remove the param from URL to avoid re-opening on refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete('add');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);
  
  // Reconstruct dates from the serialized data
  const weekDays = initialWeekDays.map(wd => ({
    ...wd,
    date: new Date(wd.date)
  }));

  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const findReservations = (day: Date, hour: number) => {
    return planningData?.reservations.filter((res: any) => {
      const resDate = new Date(res.start_time);
      return resDate.getDate() === day.getDate() && 
             resDate.getMonth() === day.getMonth() && 
             resDate.getFullYear() === day.getFullYear() &&
             resDate.getHours() === hour;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-body overflow-x-hidden pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-emerald-950 mb-2">Mes Cours de la Semaine</h1>
          <p className="font-body text-lg text-secondary font-medium italic opacity-80">Planning Moniteur — Courts de Terre Battue & Quick</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-2.5 rounded-full flex items-center gap-6 shadow-sm border border-emerald-900/5 text-sm font-bold text-emerald-950">
            <Link href={`?monday=${prevWeekStr}`} className="hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-xl align-middle">chevron_left</span>
            </Link>
            <span className="min-w-[120px] text-center">{formatMonthRange}</span>
            <Link href={`?monday=${nextWeekStr}`} className="hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-xl align-middle">chevron_right</span>
            </Link>
          </div>
          <button className="bg-emerald-950 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-emerald-900 transition-all shadow-md group">
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">filter_list</span>
            <span>Filtres</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Main Schedule Grid */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-3xl p-8 shadow-ambient border border-emerald-900/5 overflow-hidden">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full min-w-[800px] border-collapse table-fixed">
              <thead>
                <tr className="bg-emerald-100/40 border-b-2 border-emerald-900/20">
                  <th className="py-5 w-20 text-center font-black text-[10px] uppercase tracking-widest text-emerald-900/60 border-r-2 border-emerald-900/10">Heure</th>
                  {weekDays.map((day, idx) => (
                    <th key={idx} className={`py-5 px-2 font-black text-center border-r border-emerald-900/10 last:border-r-0 ${day.isToday ? 'bg-secondary/10 text-secondary' : 'text-emerald-950'}`}>
                      <div className="text-[10px] opacity-50 mb-1 font-bold">{day.name.split(' ')[0]}</div>
                      <div className="text-lg leading-none font-extrabold">{day.name.split(' ')[1]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-emerald-900/10">
                {hours.map((hour) => (
                  <tr key={hour} className={`group transition-colors ${hour % 2 === 0 ? 'bg-white' : 'bg-emerald-50/40'}`}>
                    <td className="py-8 text-center text-xs font-black text-emerald-900/70 align-middle border-r-2 border-emerald-900/10 bg-emerald-100/20">
                      {hour}h
                    </td>
                    {weekDays.map((day, dayIdx) => {
                      const dayRes = findReservations(day.date, hour);
                      const myRes = dayRes.find((r: any) => r.isMine);
                      const otherRes = dayRes.filter((r: any) => !r.isMine);
                      const totalCourts = planningData?.courts?.length || 6;
                      const freeCourtsCount = totalCourts - dayRes.length;
                      
                      return (
                        <td key={dayIdx} className={`px-2 py-3 border-r border-emerald-900/10 last:border-r-0 transition-all duration-300 relative ${day.isToday ? 'bg-secondary/[0.03]' : ''}`}>
                          <div className="min-h-[100px] flex flex-col gap-2">
                            {/* 1. My Reservation Priority */}
                            {myRes && (
                              <div className={`rounded-xl p-3 flex flex-col justify-between shadow-md border-l-4 transform hover:scale-[1.02] transition-all duration-300 group/card ${
                                myRes.type === 'cours' || myRes.course_type
                                ? 'bg-secondary text-white border-secondary-container' 
                                : 'bg-emerald-950 text-white border-emerald-800'
                              }`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[8px] uppercase font-black tracking-widest opacity-80">
                                    {myRes.course_type || 'Mon Cours'}
                                  </span>
                                </div>
                                <p className="font-bold text-[11px] truncate leading-tight">
                                  {myRes.student_name_manual || (myRes.profiles?.prenom ? `${myRes.profiles.prenom} ${myRes.profiles.nom}` : 'Réservation')}
                                </p>
                                <p className="text-[8px] font-medium opacity-70 flex items-center gap-1 mt-1">
                                   <span className="material-symbols-outlined text-[10px]">location_on</span>
                                   {myRes.courts?.nom}
                                </p>
                              </div>
                            )}

                            {/* 2. Other Reservations Summary */}
                            {otherRes.length > 0 && !myRes && (
                              <div className="rounded-xl p-2.5 bg-white border border-emerald-900/20 text-emerald-900/70 shadow-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-secondary">group</span>
                                <span className="text-[9px] font-black uppercase tracking-tight">
                                  {otherRes.length} Court{otherRes.length > 1 ? 's' : ''} Occupé{otherRes.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                            {/* 3. Add Button if courts available */}
                            {freeCourtsCount > 0 && (
                              <button 
                                onClick={() => {
                                  setSelectedSlot({ 
                                    date: day.date.toISOString().split('T')[0], 
                                    startTime: String(hour).padStart(2, '0') + ':00' 
                                  });
                                  setIsModalOpen(true);
                                }}
                                className={`w-full rounded-xl border-2 border-dashed border-emerald-900/20 flex items-center justify-center text-emerald-900/30 hover:border-secondary/60 hover:bg-secondary/10 hover:text-secondary transition-all duration-300 group ${myRes || otherRes.length > 0 ? 'py-2 mt-auto' : 'flex-grow'}`}
                              >
                                <span className={`material-symbols-outlined group-hover:rotate-90 transition-transform duration-500 ${myRes || otherRes.length > 0 ? 'text-lg' : 'text-2xl'}`}>add</span>
                                {(myRes || otherRes.length > 0) && <span className="text-[9px] font-black uppercase ml-1">{freeCourtsCount} Libres</span>}
                              </button>
                            )}
                            
                            {freeCourtsCount === 0 && !myRes && (
                              <div className="h-full flex-grow w-full bg-secondary/5 rounded-xl border border-secondary/20 flex flex-col items-center justify-center text-secondary/40 gap-1">
                                <span className="material-symbols-outlined text-lg">block</span>
                                <span className="text-[9px] font-black uppercase">Complet</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Panel */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          {/* Daily Stats Card */}
          <div className="bg-emerald-950 text-white p-8 rounded-3xl relative overflow-hidden group shadow-ambient flex flex-col min-h-[220px]">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-[9rem]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_tennis</span>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/50 mb-6">Aujourd'hui</h4>
            <div className="space-y-6 flex-grow">
              <div>
                <p className="text-5xl font-black tracking-tighter">{planningData?.stats.todayHours || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30">Heures de cours</p>
              </div>
              <div>
                <p className="text-5xl font-black tracking-tighter">{planningData?.stats.todayStudents || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30">Élèves encadrés</p>
              </div>
            </div>
          </div>

          {/* Court Availability Card */}
          <div className="bg-white p-8 rounded-3xl space-y-8 shadow-ambient border border-emerald-900/5">
            <div className="flex items-center justify-between">
               <h4 className="text-sm font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Disponibilité
              </h4>
               <span className="material-symbols-outlined text-emerald-900/20">analytics</span>
            </div>
            <div className="space-y-4">
              {planningData?.courts.map((court: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-950/70 group-hover:text-emerald-950 transition-colors">{court.name}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-900/30">Court Quick</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-tighter border flex items-center gap-1.5 ${
                    court.status === 'LIBRE' 
                    ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' 
                    : 'bg-secondary/5 text-secondary border-secondary/10'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${court.status === 'LIBRE' ? 'bg-emerald-600' : 'bg-secondary'}`}></span>
                    {court.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full text-emerald-950 border-2 border-emerald-950/5 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95">
              Voir tous les courts
            </button>
          </div>
        </aside>
      </div>


      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-12 right-12 w-16 h-16 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
        <span className="absolute right-20 bg-emerald-950 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-emerald-800">
          Nouveau Cours
        </span>
      </button>

      {/* Add Course Modal */}
      <AddCourseModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        courts={planningData?.courts.map((c: any) => ({ id: c.id, nom: c.name })) || []}
        students={students}
        initialData={selectedSlot}
      />
    </div>
  );
}
