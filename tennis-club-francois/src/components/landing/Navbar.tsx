'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md shadow-[0_20px_50px_rgba(25,28,27,0.06)]">
      <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tighter font-headline">
          <Link href="/">Tennis Club du François</Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-lexend tracking-tight text-sm font-semibold">
          <Link
            className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
            href="/login"
          >
            Réservations
          </Link>
          <Link
            className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
            href="/tarifs"
          >
            Tarifs
          </Link>
          <Link
            className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
            href="/club"
          >
            Club
          </Link>
          <Link
            className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
            href="/contact"
          >
            Contact
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:flex items-center gap-2 bg-secondary text-on-secondary px-6 py-2.5 rounded-full font-bold text-sm scale-95 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
            Mon Profil
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-emerald-950 border-t border-emerald-200/20">
          <div className="flex flex-col gap-4 px-8 py-6">
            <Link
              className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
            >
              Réservations
            </Link>
            <Link
              className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
              href="/tarifs"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tarifs
            </Link>
            <Link
              className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
              href="/club"
              onClick={() => setMobileMenuOpen(false)}
            >
              Club
            </Link>
            <Link
              className="text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-900 dark:hover:text-emerald-50 transition-all duration-300"
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-2.5 rounded-full font-bold text-sm mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
              Mon Profil
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
