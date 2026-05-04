"use client";

import Image from 'next/image';
import { MotionViewport } from '@/components/ui/motion-viewport';
import { motion } from 'framer-motion';

export function PhilosophySection() {
  return (
    <section className="max-w-screen-xl mx-auto px-8 py-32 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Text Content */}
        <MotionViewport direction="right" distance={100}>
          <h2 className="font-headline text-secondary text-base font-bold uppercase tracking-[0.3em] mb-6">
            L&apos;Esprit Eco-Luxe
          </h2>
          <h3 className="font-headline text-primary text-5xl md:text-6xl font-black tracking-tighter mb-10 leading-[1.1]">
            L&apos;élégance du sport, la <span className="text-secondary">force</span> de la Martinique.
          </h3>
          <p className="text-on-surface-variant text-xl leading-relaxed mb-12 font-medium">
            Le Club de Tennis du François n&apos;est pas simplement un lieu de pratique sportive.
            C&apos;est une <span className="text-primary font-bold">immersion sensorielle</span> où la précision du Quick rencontre la luxuriance
            tropicale. Nous cultivons une approche durable et haut de gamme, offrant à nos membres
            un sanctuaire de sérénité au milieu des palmiers.
          </p>
          
          {/* Stats with Stagger */}
          <MotionViewport stagger direction="up" distance={20} className="flex gap-16">
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <span className="block text-primary font-headline text-5xl font-black mb-2">100%</span>
              <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest opacity-60">Énergie Solaire</span>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <span className="block text-primary font-headline text-5xl font-black mb-2">Zéro</span>
              <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest opacity-60">Plastique</span>
            </motion.div>
          </MotionViewport>
        </MotionViewport>

        {/* Image with Parallax / Scale effect */}
        <MotionViewport direction="left" distance={100} className="relative">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] relative z-10 border-8 border-white"
          >
            <Image
              alt="Ambiance tropicale club"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7yDJJf-MUMeVzHGSUkbMXtHRou4WbAs0kpVTYRIfo37vNKzuuU8QW4z5pBiWIY1Pi4ch9IP1PoO15_BAEezmRlYMkNE9LYlkcA93-8YdeqmZI57fGTJK3KzjqScW6szJLkCauoWWHZNJfj-2MfvvXHqMiMXsJpO9M766uRCPsSNe-yper-fDqks6aqXWXtPPLfUJBVF8HFlUfdvhpMNHA9NkjhaerUBHGB9QBRjvURxYA_yWWerTnVez1VXmPjpvFx1Qg0DjewjY"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          
          {/* Decorative Elements */}
          <motion.div 
            animate={{ 
              rotate: [0, 5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10"
          />
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 rounded-2xl -z-10 animate-pulse" />
        </MotionViewport>
      </div>
    </section>
  );
}
