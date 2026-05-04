'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddMemberModal } from './modals/AddMemberModal';
import { ReservationModal } from './modals/ReservationModal';
import { BlockCourtModal } from './modals/BlockCourtModal';

type ActiveModal = 'member' | 'reservation' | 'block' | null;

export function QuickActions() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" as const }
    },
  };

  const handleOpenModal = (modal: ActiveModal) => {
    setActiveModal(modal);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const actions = [
    { id: 'member', label: 'Ajouter un Membre', icon: 'person_add' },
    { id: 'reservation', label: 'Nouvelle Réservation', icon: 'event_available' },
    { id: 'block', label: 'Bloquer un Court', icon: 'block' },
  ];

  return (
    <>
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="col-span-12 lg:col-span-4 p-8 rounded-[2rem] bg-surface-container-low border border-outline-variant/30 shadow-xl"
      >
        <h3 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-3xl">bolt</span> 
          Actions Rapides
        </h3>
        
        <div className="flex flex-col gap-4">
          {actions.map((action) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ x: 8, backgroundColor: "rgba(255, 193, 7, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenModal(action.id as ActiveModal)}
              className="flex items-center gap-5 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 transition-all text-left w-full group shadow-sm hover:shadow-md hover:border-secondary/30"
              type="button"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                <span className="material-symbols-outlined text-secondary group-hover:text-on-secondary transition-colors text-2xl">
                  {action.icon}
                </span>
              </div>
              <span className="font-black text-sm text-primary flex-1 tracking-tight">
                {action.label}
              </span>
              <span className="material-symbols-outlined text-outline-variant/40 group-hover:text-secondary group-hover:translate-x-1 transition-all">
                arrow_forward
              </span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Modales avec gestion de présence (si les modales supportent Framer Motion en interne) */}
      <AnimatePresence>
        {activeModal === 'member' && (
          <AddMemberModal isOpen onClose={handleCloseModal} />
        )}
        {activeModal === 'reservation' && (
          <ReservationModal isOpen onClose={handleCloseModal} />
        )}
        {activeModal === 'block' && (
          <BlockCourtModal isOpen onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </>
  );
}
