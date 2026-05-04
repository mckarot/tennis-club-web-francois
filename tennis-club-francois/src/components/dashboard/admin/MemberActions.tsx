'use client';

import React, { useState } from 'react';
import { EditMemberModal } from './modals/EditMemberModal';

interface MemberActionsProps {
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

export function MemberActions({ member }: MemberActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 flex-shrink-0">
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md text-sm"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Modifier le profil
        </button>
        <button className="bg-surface-container-high border border-outline-variant/30 text-error px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-error hover:text-white transition-all shadow-sm text-sm">
          <span className="material-symbols-outlined text-base">block</span>
          Suspendre
        </button>
      </div>

      <EditMemberModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        member={member}
      />
    </>
  );
}
