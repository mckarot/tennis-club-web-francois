"use client";

import { motion } from "framer-motion";
import type { ReservationWithDetails } from "@/lib/types/dashboard";

interface RecentReservationsProps {
  reservations: ReservationWithDetails[];
}

export function RecentReservations({ reservations }: RecentReservationsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const rowVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
  };

  return (
    <motion.section 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="col-span-12 lg:col-span-7 p-8 rounded-[2rem] bg-white border border-outline-variant/10 shadow-xl"
    >
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-black text-primary tracking-tight">Dernières Réservations</h3>
        <motion.button 
          whileHover={{ scale: 1.05, x: 5 }}
          className="text-secondary text-xs font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
        >
          Voir tout <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </motion.button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/20 text-outline-variant text-[10px] uppercase tracking-[0.2em] font-black">
              <th className="pb-5 px-2">Membre</th>
              <th className="pb-5 px-2">Court</th>
              <th className="pb-5 px-2">Horaire</th>
              <th className="pb-5 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-outline-variant/5"
          >
            {reservations.slice(0, 4).map((reservation) => {
              const nom = reservation.user?.nom || 'Inconnu';
              const prenom = reservation.user?.prenom || '';
              const initials = (prenom?.[0] || '') + (nom?.[0] || '');
              const startTime = new Date(reservation.date_heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
              const endTime = new Date(reservation.date_heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
              const courtNom = reservation.court?.nom || 'Court inconnu';

              return (
                <motion.tr 
                  key={reservation.id} 
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.01)", x: 4 }}
                  className="group transition-all cursor-default"
                >
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-xs font-black text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300">
                        {initials || '??'}
                      </div>
                      <span className="text-sm font-bold text-primary tracking-tight">
                        {prenom} {nom}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-2">
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10">
                      {courtNom}
                    </span>
                  </td>
                  <td className="py-5 px-2 text-sm text-on-surface-variant font-medium">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline-variant text-base">schedule</span>
                      {startTime} - {endTime}
                    </span>
                  </td>
                  <td className="py-5 px-2 text-right">
                    <motion.button 
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-outline-variant hover:text-secondary hover:bg-secondary/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </motion.section>
  );
}
