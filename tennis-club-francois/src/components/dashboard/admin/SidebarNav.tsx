'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * SidebarNav - Navigation latérale interactive avec animations senior
 */
export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/dashboard/admin',
      label: 'Tableau de bord',
      icon: 'grid_view',
      exact: true
    },
    {
      href: '/dashboard/admin/membres',
      label: 'Membres',
      icon: 'people',
      exact: false
    },
    {
      href: '/dashboard/admin/planning',
      label: 'Planning',
      icon: 'calendar_month',
      exact: false
    },
    {
      href: '/dashboard/admin/parametres',
      label: 'Paramètres',
      icon: 'settings',
      exact: false
    }
  ];

  return (
    <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
      {links.map((link) => {
        const isActive = link.exact 
          ? pathname === link.href 
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative block group"
          >
            <div
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 border ${
                isActive
                  ? 'bg-white/10 text-white border-white/10 shadow-lg'
                  : 'text-white/50 hover:bg-white/5 hover:text-white border-transparent'
              }`}
            >
              {/* Background Highlight for Active Link */}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-secondary/10 rounded-2xl -z-10"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <span className={`material-symbols-outlined text-2xl transition-transform duration-300 ${isActive ? 'text-secondary scale-110' : 'group-hover:scale-110'}`}>
                {link.icon}
              </span>
              <span className={`font-headline text-sm tracking-wide ${isActive ? 'font-black' : 'font-bold'}`}>
                {link.label}
              </span>
              
              {isActive && (
                 <motion.div 
                   layoutId="active-dot"
                   className="ml-auto w-2 h-2 rounded-full bg-secondary shadow-[0_0_12px_rgba(255,193,7,0.6)]" 
                 />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
