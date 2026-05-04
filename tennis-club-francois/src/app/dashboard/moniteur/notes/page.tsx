import React from 'react';
import { getMoniteurStudentsData } from '../eleves/actions';
import Link from 'next/link';
import NoteForm from './NoteForm';

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);

const IconNotebook = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M12 7h4" /><path d="M12 11h4" /><path d="M12 15h4" /><path d="M8 7h.01" /><path d="M8 11h.01" /><path d="M8 15h.01" />
  </svg>
);

export default async function NoterElevePage() {
  const { students } = await getMoniteurStudentsData();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Link 
              href="/dashboard/moniteur" 
              className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-black transition-colors mb-4 group"
            >
              <IconChevronLeft />
              <span className="ml-1 group-hover:-translate-x-1 transition-transform">Retour au tableau de bord</span>
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <span className="p-3 bg-[#c5eadf] text-[#01261f] rounded-2xl shadow-lg ring-1 ring-black/5">
                <IconNotebook />
              </span>
              Carnet de Suivi
            </h1>
            <p className="text-gray-500 font-medium text-lg max-w-xl">
              Gérez les notes, les conseils techniques et la progression de vos élèves de manière professionnelle.
            </p>
          </div>
        </div>

        <div className="w-full">
          {students && students.length > 0 ? (
            <NoteForm 
              students={students.map(s => ({
                id: s.id,
                nom: s.nom,
                prenom: s.prenom
              }))} 
            />
          ) : (
            <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconNotebook />
              </div>
              <p className="text-gray-400 font-bold text-xl uppercase tracking-tighter">Aucun élève à suivre pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
