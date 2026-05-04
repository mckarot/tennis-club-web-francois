'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/dashboard/actions';

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const result = await logoutAction();
      if (result.success) {
        // Redirige vers la page de login
        router.push('/login');
        router.refresh(); // S'assure que la session est bien vidée partout
      }
    } catch (error) {
      console.error('[Logout] Échec:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        px-6 py-2 rounded-full text-xs font-bold shadow-sm border 
        transition-all duration-200
        ${isLoggingOut 
          ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' 
          : 'bg-error-container text-error hover:bg-error hover:text-on-error border-error/10'
        }
      `}
      aria-label="Se déconnecter"
    >
      {isLoggingOut ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ...
        </span>
      ) : (
        'Déconnexion'
      )}
    </button>
  );
}
