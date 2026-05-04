"use client";

import { motion } from "framer-motion";

interface Court {
  id: string;
  nom: string;
  type: string;
  disponible: boolean;
  occupation?: any;
}

interface CourtsOverviewProps {
  courts: Court[];
}

export function CourtsOverview({ courts }: CourtsOverviewProps) {
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="col-span-12 lg:col-span-8 p-8 rounded-[2rem] bg-primary text-white shadow-2xl overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

      <h3 className="text-xl font-black mb-8 flex items-center gap-3">
        <motion.span 
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="material-symbols-outlined text-secondary text-3xl"
        >
          sports_tennis
        </motion.span> 
        État des Courts
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {courts.map((court) => (
          <motion.div
            key={court.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            className={`bg-white/10 rounded-2xl p-4 flex items-center justify-between border transition-colors cursor-default ${
              court.disponible ? 'border-white/10' : 'border-secondary/40 ring-1 ring-secondary/40'
            }`}
          >
            <div>
              <p className="text-[10px] uppercase opacity-50 font-black tracking-widest">{court.nom}</p>
              <p className="text-sm font-bold mt-1">{court.type}</p>
            </div>
            <div className="relative">
              {court.disponible && (
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-400 rounded-full"
                />
              )}
              <span
                className={`relative z-10 w-3.5 h-3.5 rounded-full flex shrink-0 ${
                  court.disponible
                    ? 'bg-emerald-400'
                    : 'bg-secondary shadow-[0_0_12px_rgba(255,193,7,0.4)]'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
