"use client";

import { MotionViewport } from "@/components/ui/motion-viewport";
import { motion } from "framer-motion";

export function ServicesSection() {
  const services = [
    {
      icon: 'sports_tennis',
      title: '6 Courts Premium',
      description: 'Surfaces Quick haut de gamme, entretenues quotidiennement pour une expérience de jeu professionnelle sous les alizés.',
    },
    {
      icon: 'school',
      title: 'Coaching de Haut Niveau',
      description: 'Nos instructeurs certifiés vous accompagnent, du perfectionnement technique à la préparation physique intensive.',
    },
    {
      icon: 'local_bar',
      title: 'Lounge & Bar',
      description: 'Détendez-vous après l&apos;effort avec nos jus de fruits frais locaux et cocktails signature dans un cadre ventilé et raffiné.',
    },
  ];

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <section className="bg-surface-container-low py-32 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-8">
        <MotionViewport direction="up" className="text-center mb-20">
          <h3 className="font-headline text-primary text-5xl font-black tracking-tight">
            L'Excellence du <span className="text-secondary">Tennis</span>
          </h3>
          <div className="w-24 h-1.5 bg-secondary mx-auto mt-6 rounded-full" />
        </MotionViewport>
        
        <MotionViewport 
          stagger 
          direction="none" 
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="relative bg-surface-container-lowest p-10 rounded-2xl bento-card-hover shadow-ambient group overflow-hidden border border-white/10"
            >
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-secondary transition-all duration-500 shadow-lg">
                  <span className="material-symbols-outlined text-white text-4xl">
                    {service.icon}
                  </span>
                </div>
                <h4 className="font-headline text-primary text-2xl font-bold mb-4 group-hover:translate-x-1 transition-transform">
                  {service.title}
                </h4>
                <p className="text-on-surface-variant leading-relaxed">
                  {service.description}
                </p>
                
                {/* Petit indicateur visuel en bas */}
                <div className="mt-8 flex items-center text-secondary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  <span className="text-sm font-bold uppercase tracking-wider">En savoir plus</span>
                  <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          ))}
        </MotionViewport>
      </div>
    </section>
  );
}
