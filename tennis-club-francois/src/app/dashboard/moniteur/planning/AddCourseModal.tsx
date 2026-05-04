'use client';

import React, { useState, useEffect } from 'react';
import { addCourse } from './actions';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  nom: string;
  prenom: string;
  level: string | null;
}

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: { id: number; nom: string }[];
  students: Student[];
  initialData?: {
    date?: string;
    startTime?: string;
  } | null;
}

export default function AddCourseModal({ isOpen, onClose, courts, students, initialData }: AddCourseModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseType, setCourseType] = useState<'individuel' | 'collectif' | 'stage'>('individuel');
  
  // Form fields
  const [courtId, setCourtId] = useState<number>(courts[0]?.id || 1);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<number>(60);
  
  // Individual fields
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [manualStudentName, setManualStudentName] = useState<string>('');
  const [studentLevel, setStudentLevel] = useState<string>('');
  
  // Collective fields
  const [studentCount, setStudentCount] = useState<number>(1);
  
  // Common
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData?.date) setDate(initialData.date);
    if (initialData?.startTime) setStartTime(initialData.startTime);
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const result = await addCourse({
        courtId: courtId.toString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        courseType,
        studentId: courseType === 'individuel' ? (selectedStudentId || undefined) : undefined,
        studentNameManual: courseType === 'individuel' ? (manualStudentName || undefined) : undefined,
        studentLevel: courseType === 'individuel' ? (studentLevel || undefined) : undefined,
        studentCount: courseType === 'collectif' ? studentCount : (courseType === 'stage' ? studentCount : 1),
        notes: notes || undefined,
      });

      if (result && !result.success) {
        alert(`Erreur lors de l’ajout du cours : ${result.error || 'Erreur inconnue'}`);
        return;
      }

      onClose();
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Une erreur réseau est survenue lors de l’envoi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[var(--color-primary)] border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-500/10 flex justify-between items-center bg-emerald-500/5">
          <h2 className="text-xl font-bold text-white tracking-tight">Ajouter un nouveau cours</h2>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de cours */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            {(['individuel', 'collectif', 'stage'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCourseType(type)}
                className={`py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                  courseType === type 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Court Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Court</label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(Number(e.target.value))}
                className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
              >
                {courts.map(court => (
                  <option key={court.id} value={court.id} className="bg-[var(--color-primary)] text-white">
                    {court.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Heure de début</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark]"
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Durée (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
              >
                <option value={30} className="bg-[var(--color-primary)]">30 min</option>
                <option value={60} className="bg-[var(--color-primary)]">1h</option>
                <option value={90} className="bg-[var(--color-primary)]">1h30</option>
                <option value={120} className="bg-[var(--color-primary)]">2h</option>
              </select>
            </div>
          </div>

          {/* Dynamic Fields Type dependant */}
          {courseType === 'individuel' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Élève inscrit</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    if (e.target.value) {
                      const student = students.find(s => s.id === e.target.value);
                      if (student) {
                        setManualStudentName(`${student.prenom} ${student.nom}`);
                        setStudentLevel(student.level || '');
                      }
                    }
                  }}
                  className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                >
                  <option value="" className="bg-[var(--color-primary)]">-- Sélectionner un élève --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="bg-[var(--color-primary)]">
                      {s.prenom} {s.nom} ({s.level || 'NC'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Nom (Saisie manuelle)</label>
                  <input
                    type="text"
                    value={manualStudentName}
                    onChange={(e) => {
                      setManualStudentName(e.target.value);
                      if (!e.target.value) setSelectedStudentId('');
                    }}
                    placeholder="Prénom Nom"
                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Niveau</label>
                  <input
                    type="text"
                    value={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.value)}
                    placeholder="ex: 15/2"
                    className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {(courseType === 'collectif' || courseType === 'stage') && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium text-white/70">Nombre d'élèves</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="flex-1 accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 h-10 flex items-center justify-center bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                  {studentCount}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Notes (Optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails du cours, objectifs..."
              rows={2}
              className="w-full bg-white/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Traitement...</span>
                </>
              ) : (
                'Confirmer l’ajout'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
