'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useActionState } from 'react';
import { updateMemberProfileAction } from '@/app/dashboard/admin/membres/[id]/actions';
import type { ActionResult } from '@/lib/types/actions';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    phone: string | null;
    level: string;
    role: string;
    statutAdhesion: string;
    typeAbonnement: string;
  };
}

export function EditMemberModal({ isOpen, onClose, member }: EditMemberModalProps) {
  const [state, formAction, isPending] = useActionState(
    updateMemberProfileAction,
    { success: false, error: '', code: 'INTERNAL_ERROR' } as ActionResult<any>
  );

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Fermeture auto après succès
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, onClose]);

  // Focus trap et gestion Echap
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="glass-card rounded-[2rem] p-8 w-full max-w-lg relative shadow-2xl border border-white/10"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-white font-headline tracking-tight">Modifier le Profil</h2>
          <p className="text-white/60 text-sm mt-1 font-medium">Mettez à jour les informations de {member.prenom}</p>
        </div>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="memberId" value={member.id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Prénom</label>
              <input
                type="text"
                name="prenom"
                defaultValue={member.prenom}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Nom</label>
              <input
                type="text"
                name="nom"
                defaultValue={member.nom}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Téléphone</label>
            <input
              type="tel"
              name="phone"
              defaultValue={member.phone || ''}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Niveau</label>
              <select
                name="level"
                defaultValue={member.level?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'non classe' ? 'nc' : member.level}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all appearance-none"
              >
                <option value="nc" className="bg-[#01261f]">Non Classé</option>
                <option value="debutant" className="bg-[#01261f]">Débutant</option>
                <option value="intermediaire" className="bg-[#01261f]">Intermédiaire</option>
                <option value="avance" className="bg-[#01261f]">Avancé</option>
                <option value="expert" className="bg-[#01261f]">Expert</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Abonnement</label>
              <select
                name="typeAbonnement"
                defaultValue={member.typeAbonnement}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all appearance-none"
              >
                <option value="mensuel" className="bg-[#01261f]">Mensuel</option>
                <option value="trimestriel" className="bg-[#01261f]">Trimestriel</option>
                <option value="annuel" className="bg-[#01261f]">Annuel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Rôle</label>
              <select
                name="role"
                defaultValue={member.role}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all appearance-none"
              >
                <option value="membre" className="bg-[#01261f]">Membre</option>
                <option value="moniteur" className="bg-[#01261f]">Moniteur</option>
                <option value="admin" className="bg-[#01261f]">Administrateur</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Statut Adhésion</label>
              <select
                name="statutAdhesion"
                defaultValue={member.statutAdhesion}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all appearance-none"
              >
                <option value="actif" className="bg-[#01261f]">Actif</option>
                <option value="suspendu" className="bg-[#01261f]">Suspendu</option>
                <option value="inactif" className="bg-[#01261f]">Inactif</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-secondary text-white font-black uppercase tracking-widest text-xs py-4 rounded-full shadow-xl hover:shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isPending ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </button>

          {state.error && (
            <p className="text-red-400 text-xs font-bold text-center mt-2">{state.error}</p>
          )}
          {state.success && (
            <p className="text-emerald-400 text-xs font-bold text-center mt-2">Profil mis à jour avec succès !</p>
          )}
        </form>
      </div>
    </div>
  );
}
