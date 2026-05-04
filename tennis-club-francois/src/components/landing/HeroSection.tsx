'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  availableCourts?: number;
}

export function HeroSection({ availableCourts = 4 }: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="relative h-[921px] min-h-[600px] w-full px-4 md:px-8 py-4 overflow-hidden">
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative h-full w-full rounded-2xl overflow-hidden shadow-ambient"
      >
        {/* Background Image with subtle Ken Burns effect */}
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <Image
            alt="Court de tennis tropical"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvcBUGChZKc2SvxLW3SEYvCSOQLDqo9JT0LzyiT35ZEMdz09Ee4u6pfJDifrtm0JxXpJ-ai3CFTj_SaQUxvRxGvBwj47H1iYTMjoCXFRO_xkvsJO3eSp3DX2hoqlz7dzLxUdDtiK0zwrrhU-uKdly3-913Kv6HYku0hZEWdOVEGItd-hIFlCnsdlRERgn3DN2KgFuV4SnSY7UXV8cQtg1mD_QaHjrCVv1VnuHBZyz0I8a5nOV-az_Ewrd3FNUego3aDHbmw60C7yA"
            fill
            sizes="100vw"
            priority
          />
        </motion.div>
        
        {/* Gradient Overlay - Darker for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>

        {/* Content Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="bg-secondary/20 text-secondary border border-secondary/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest backdrop-blur-sm">
              L'Habitation Tennis Club
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="font-headline text-white text-6xl md:text-8xl font-black tracking-tighter max-w-5xl leading-[0.9] mb-10 drop-shadow-2xl"
          >
            Vivez le tennis en <span className="text-secondary">plein cœur</span> de la nature
          </motion.h1>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/login"
                className="inline-block bg-secondary text-on-secondary px-12 py-5 rounded-full font-black text-xl shadow-lg hover:shadow-secondary/20 transition-all"
              >
                Réserver un court
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/club"
                className="inline-block glass-panel text-white px-12 py-5 rounded-full font-bold text-xl border border-white/20 hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Découvrir le club
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Court Status Badge - Floating Animation */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
          className="absolute bottom-10 right-10 glass-panel rounded-2xl px-8 py-4 flex items-center gap-4 border border-white/10 shadow-2xl backdrop-blur-xl"
        >
          <div className="relative">
            <div className="w-4 h-4 bg-emerald-400 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-4 h-4 bg-emerald-500 rounded-full relative"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-lg leading-none">
              {availableCourts} Courts
            </span>
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1">
              Disponibles maintenant
            </span>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
