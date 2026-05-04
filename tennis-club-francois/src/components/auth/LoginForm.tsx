'use client';

import { useActionState, useEffect } from 'react';
import { loginAction, type AuthResult } from '@/app/(auth)/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, type UserRole } from '@/types/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (prev: AuthResult, formData: FormData) => {
      return loginAction(formData);
    },
    {
      success: false,
      error: '',
      code: 'INTERNAL_ERROR' as const,
      details: {},
    }
  );

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.success && state.data?.user) {
      const role = state.data.user.role ?? 'membre';
      if (role === ROLES.ADMIN) {
        router.push('/dashboard/admin');
      } else if (role === ROLES.MONITEUR) {
        router.push('/dashboard/moniteur');
      } else {
        router.push('/dashboard/membre');
      }
    }
  }, [state, router]);

  const getFieldError = (field: 'email' | 'password'): string | undefined => {
    if (!state.success && 'details' in state && state.details) {
      return state.details[field]?.[0];
    }
    return undefined;
  };

  const errorMessage = !state.success ? state.error : '';
  const hasGlobalError = !state.success && errorMessage && state.code !== 'VALIDATION_ERROR';
  const fieldEmailError = getFieldError('email');
  const fieldPasswordError = getFieldError('password');
  const hasFieldErrors = fieldEmailError || fieldPasswordError;

  const testUsers: Record<string, { email: string; password: string; role: UserRole }> = {
    admin: { email: 'admin_club@tennis-club.fr', password: 'Admin123!', role: ROLES.ADMIN },
    membre: { email: 'marie.laurent@email.com', password: 'Membre123!', role: ROLES.MEMBRE },
    moniteur: { email: 'moniteur_v2@tennis-club.fr', password: 'Moniteur123!', role: ROLES.MONITEUR },
  };

  const fillCredentials = (userType: keyof typeof testUsers) => {
    const user = testUsers[userType];
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const form = emailInput?.closest('form');
    
    if (emailInput) {
      emailInput.value = user.email;
      const event = new Event('input', { bubbles: true });
      emailInput.dispatchEvent(event);
    }
    if (passwordInput) {
      passwordInput.value = user.password;
      const event = new Event('input', { bubbles: true });
      passwordInput.dispatchEvent(event);
    }

    if (form) {
      setTimeout(() => {
        form.requestSubmit();
      }, 100);
    }
  };

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

  return (
    <>
      {/* Boutons de remplissage rapide animés */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-10 p-5 bg-white/5 rounded-2xl border border-white/10"
      >
        <p className="text-white/40 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">
          ⚡ Remplissage rapide
        </p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(testUsers).map(([type, user], index) => (
            <motion.button
              key={type}
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fillCredentials(type as keyof typeof testUsers)}
              className={`px-3 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                type === 'admin' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20' :
                type === 'membre' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20' :
                'bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20'
              }`}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.form 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        action={formAction} 
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-white/70 font-bold text-xs uppercase tracking-widest ml-2" htmlFor="email">
            Email professionnel
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-secondary transition-colors text-2xl">
              mail
            </span>
            <input
              className={`w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-white/20 focus:bg-white/10 focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all outline-none font-medium ${
                hasFieldErrors || hasGlobalError ? 'border-error/50 bg-error/5' : ''
              }`}
              id="email"
              name="email"
              placeholder="votre@email.com"
              type="email"
              disabled={isPending}
            />
          </div>
          <AnimatePresence>
            {fieldEmailError && (
              <motion.p 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-error text-[11px] font-bold ml-2 italic"
              >
                {fieldEmailError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-white/70 font-bold text-xs uppercase tracking-widest ml-2" htmlFor="password">
            Mot de passe
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-secondary transition-colors text-2xl">
              lock
            </span>
            <input
              className={`w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white placeholder-white/20 focus:bg-white/10 focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all outline-none font-medium ${
                hasFieldErrors || hasGlobalError ? 'border-error/50 bg-error/5' : ''
              }`}
              id="password"
              name="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              disabled={isPending}
            />
            <button
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
            >
              <span className="material-symbols-outlined text-2xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <AnimatePresence>
            {fieldPasswordError && (
              <motion.p 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-error text-[11px] font-bold ml-2 italic"
              >
                {fieldPasswordError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end">
          <Link
            className="text-white/40 text-[11px] font-bold hover:text-secondary transition-colors tracking-widest uppercase border-b border-transparent hover:border-secondary pb-0.5"
            href="/forgot-password"
          >
            Identifiants oubliés ?
          </Link>
        </motion.div>

        <AnimatePresence>
          {hasGlobalError && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-error/10 border border-error/20 rounded-2xl p-4 text-center"
            >
              <p className="text-error text-xs font-black uppercase tracking-wider">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={!isPending ? { scale: 1.02, y: -2 } : {}}
            whileTap={!isPending ? { scale: 0.98 } : {}}
            className={`w-full bg-secondary text-on-secondary font-headline font-black py-5 rounded-2xl shadow-xl shadow-secondary/20 uppercase tracking-[0.2em] text-sm relative overflow-hidden group ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={isPending}
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative z-10">
              {isPending ? 'Authentification...' : 'Accéder au Club'}
            </span>
          </motion.button>
        </motion.div>
      </motion.form>
    </>
  );
}
