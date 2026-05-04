'use client';

import { useEffect } from 'react';

/**
 * Error Boundary pour le Dashboard Admin
 * 
 * Capture les erreurs dans le layout et les pages enfants
 * Affiche un message utilisateur-friendly avec option de retry
 */
export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Dashboard Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-error">error</span>
        </div>
        
        <h2 className="font-headline text-2xl font-bold text-primary mb-3">
          Oups, une erreur est survenue
        </h2>
        
        <p className="font-body text-on-surface-variant mb-6">
          Le tableau de bord n&apos;a pas pu être chargé. Veuillez réessayer dans quelques instants.
        </p>
        
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-body text-sm font-bold shadow-lg hover:bg-primary-container transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Réessayer
          </button>
          
          <a
            href="/dashboard/membre"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-body text-sm font-semibold border border-outline-variant/20 hover:bg-surface-container-highest transition-all"
          >
            Retour au dashboard
          </a>
        </div>
        
        {process.env.NODE_ENV === 'development' && error?.message && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-on-surface-variant cursor-pointer mb-2">
              Détails techniques (développement)
            </summary>
            <pre className="text-xs text-error bg-error-container p-4 rounded-xl overflow-auto max-h-48">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
