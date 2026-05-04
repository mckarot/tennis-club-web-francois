
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    description: string;
    category: string;
    image?: string;
    details?: string;
    participantsCount: number;
    link?: string;
  } | null;
}

export default function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#01261f]/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header Image */}
            <div className="relative h-64 md:h-72 overflow-hidden shrink-0">
              {event.image ? (
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#01261f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/10 text-9xl">event</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-[#01261f] transition-all border border-white/20 z-10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="absolute bottom-6 left-10">
                <span className="bg-[#9b4426] px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                  {event.category}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-10 md:p-14 pt-8">
              <h2 className="font-headline text-4xl font-black text-[#01261f] leading-tight mb-6 italic tracking-tighter">
                {event.title}
              </h2>
              
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#01261f]/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">group</span>
                  <span className="text-xs font-black uppercase tracking-widest text-[#414846]">
                    {event.participantsCount} Participants
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#01261f]/10" />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">verified</span>
                  <span className="text-xs font-black uppercase tracking-widest text-[#414846]">Officiel Club</span>
                </div>
              </div>

              {/* Main Description */}
              <div className="prose prose-emerald max-w-none mb-10">
                <p className="text-[#414846] text-lg leading-relaxed font-bold italic opacity-60">
                  {event.description}
                </p>
              </div>

              {/* Specific Details with Lite Markdown Parsing */}
              {event.details && (
                <div className="bg-[#f3f4f2]/50 rounded-[2rem] p-10 mb-10 border border-[#01261f]/5 space-y-8">
                   {event.details.split('\n').map((line, index) => {
                     if (line.startsWith('###')) {
                       const title = line.replace('###', '').trim();
                       let icon = 'info';
                       if (title.toLowerCase().includes('but')) icon = 'target';
                       if (title.toLowerCase().includes('modalité')) icon = 'rule';
                       if (title.toLowerCase().includes('contact')) icon = 'alternate_email';
                       if (title.toLowerCase().includes('prix') || title.toLowerCase().includes('tarif')) icon = 'payments';

                       return (
                         <div key={index} className="flex items-center gap-3 pt-2 first:pt-0">
                           <div className="w-8 h-8 rounded-lg bg-[#01261f] text-white flex items-center justify-center">
                             <span className="material-symbols-outlined text-sm">{icon}</span>
                           </div>
                           <h3 className="text-[#01261f] font-headline font-black text-lg uppercase tracking-tight">
                             {title}
                           </h3>
                         </div>
                       );
                     }
                     if (line.trim() === '') return <div key={index} className="h-2" />;
                     
                     return (
                       <p key={index} className="text-[#414846] text-sm leading-relaxed font-medium pl-11 opacity-80 italic border-l-2 border-[#01261f]/5">
                         {line}
                       </p>
                     );
                   })}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4">
                {event.link && (
                  <button 
                    onClick={() => window.open(event.link, '_blank')}
                    className="flex-grow py-5 bg-[#01261f] text-white rounded-full font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-[#01261f]/30 transition-all flex items-center justify-center gap-3 group"
                  >
                    S'inscrire en ligne
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                  </button>
                )}
                
                <button 
                   onClick={onClose}
                   className={`py-5 border-2 border-[#01261f]/10 rounded-full font-black uppercase tracking-widest text-xs text-[#01261f] hover:bg-[#01261f] hover:text-white transition-all ${event.link ? 'px-10' : 'flex-grow bg-[#01261f]/5'}`}
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
