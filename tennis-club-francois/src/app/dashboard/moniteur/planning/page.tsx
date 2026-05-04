import React from 'react';
import { createClient } from '@/lib/pocketbase/server';
import { getMoniteurPlanningData } from './actions';
import { getMoniteurStudentsData } from '../eleves/actions';
import PlanningClient from './PlanningClient';
import { redirect } from 'next/navigation';

// Helper: parse a YYYY-MM-DD string as a local date (avoids UTC shift)
function parseDateStr(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper: add N days to a YYYY-MM-DD string and return new YYYY-MM-DD string
function addDaysToStr(dateStr: string, days: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function MoniteurPlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const unresolvedSearchParams = await searchParams;
  const mondayParam = typeof unresolvedSearchParams.monday === 'string' ? unresolvedSearchParams.monday : undefined;
  
  const pb = await createClient();
  if (!pb.authStore.isValid || pb.authStore.model?.role !== 'moniteur') {
    redirect('/login');
  }

  let planningData;
  let studentsData;
  
  try {
    [planningData, studentsData] = await Promise.all([
      getMoniteurPlanningData(mondayParam),
      getMoniteurStudentsData()
    ]);
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  // Use the canonical monday string returned by the server action (already normalized to Monday)
  // This avoids any timezone shift when converting ISO → Date → format
  const mondayStr: string = planningData?.mondayStr ?? (mondayParam ?? (() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    today.setDate(diff);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })());

  const prevWeekStr = addDaysToStr(mondayStr, -7);
  const nextWeekStr = addDaysToStr(mondayStr, 7);

  // Build weekDays from the canonical string — purely arithmetic, no timezone issue
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = parseDateStr(addDaysToStr(mondayStr, i));
    const todayStr = (() => {
      const t = new Date();
      return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
    })();
    const thisStr = addDaysToStr(mondayStr, i);
    return {
      date: d.toISOString(),
      name: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }).toUpperCase(),
      isToday: thisStr === todayStr,
    };
  });

  const firstDay = parseDateStr(mondayStr);
  const lastDay = parseDateStr(addDaysToStr(mondayStr, 6));
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const formatMonthRange = `${firstDay.toLocaleDateString('fr-FR', options)} — ${lastDay.toLocaleDateString('fr-FR', options)}`;

  return (
    <PlanningClient 
      planningData={planningData}
      students={studentsData?.students || []}
      mondayParam={mondayStr}
      prevWeekStr={prevWeekStr}
      nextWeekStr={nextWeekStr}
      formatMonthRange={formatMonthRange}
      weekDays={weekDays as any}
    />
  );
}
