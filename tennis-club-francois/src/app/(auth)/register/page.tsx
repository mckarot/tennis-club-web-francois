import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-pattern">
      <main className="w-full max-w-lg">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center shadow-Ambient mb-4">
            <span className="material-symbols-outlined text-white text-5xl">sports_tennis</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tighter text-center">
            Tennis Club du François
          </h1>
          <p className="text-on-primary-fixed-variant font-medium tracking-wide mt-2 text-sm uppercase">
            Inscription
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-xl p-8 md:p-12 shadow-Ambient">
          <RegisterForm />

          {/* Footer Links */}
          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-outline-variant text-sm font-medium">
              Déjà un compte?
              <Link
                className="text-secondary-fixed ml-1 font-bold hover:underline transition-all"
                href="/login"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Support Info */}
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6">
            <a
              className="text-white/40 hover:text-white text-xs font-medium transition-colors flex items-center"
              href="#"
            >
              <span className="material-symbols-outlined text-sm mr-1">help</span>
              Aide
            </a>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <a
              className="text-white/40 hover:text-white text-xs font-medium transition-colors flex items-center"
              href="#"
            >
              <span className="material-symbols-outlined text-sm mr-1">policy</span>
              Confidentialité
            </a>
          </div>
          <p className="text-white/20 text-[10px] mt-6 tracking-widest uppercase">
            © 2024 Club de Tennis du François - Martinique
          </p>
        </footer>
      </main>
    </div>
  );
}
