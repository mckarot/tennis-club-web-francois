"use client";

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MotionViewport } from '@/components/ui/motion-viewport';

export default function LoginPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-pattern relative overflow-hidden">
      {/* Background Decorative Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Back to Home Button */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="absolute top-8 left-8 z-50"
      >
        <Link 
          href="/" 
          className="flex items-center gap-3 px-6 py-3 glass-panel rounded-full text-white font-bold hover:bg-white/10 transition-all border border-white/10 shadow-xl group backdrop-blur-md"
        >
          <span className="material-symbols-outlined transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-sm tracking-wide">Retour à l&apos;accueil</span>
        </Link>
      </motion.div>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-12">
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-secondary rounded-2xl flex items-center justify-center shadow-2xl mb-6 relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-hover:scale-110 transition-transform duration-500 blur-xl opacity-0 group-hover:opacity-100" />
            <span className="material-symbols-outlined text-white text-6xl relative z-10">sports_tennis</span>
          </motion.div>
          <h1 className="font-headline text-4xl font-black text-white tracking-tighter text-center leading-none">
            Tennis Club <br /> <span className="text-secondary">du François</span>
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-[2px] bg-white/20" />
            <p className="text-white/40 font-bold tracking-[0.3em] text-[10px] uppercase">
              Espace Membre
            </p>
            <div className="w-8 h-[2px] bg-white/20" />
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card rounded-[32px] p-10 md:p-14 shadow-2xl backdrop-blur-2xl border border-white/5 relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <LoginForm />

          {/* Footer Links */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 pt-10 border-t border-white/10 text-center"
          >
            <p className="text-white/50 text-sm font-medium">
              Pas encore membre ?
              <Link
                className="text-secondary ml-2 font-black hover:text-white transition-colors decoration-2 underline-offset-4"
                href="/register"
              >
                Créer un compte
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Support Info */}
        <motion.footer 
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center space-x-8">
            <a
              className="text-white/30 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 group"
              href="#"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">help</span>
              Aide
            </a>
            <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
            <a
              className="text-white/30 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 group"
              href="#"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">policy</span>
              Confidentialité
            </a>
          </div>
          <p className="text-white/10 text-[9px] mt-8 tracking-[0.4em] font-black uppercase">
            © 2026 L'Habitation Tennis Club - Martinique
          </p>
        </motion.footer>
      </motion.main>
    </div>
  );
}
