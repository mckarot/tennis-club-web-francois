import React from 'react';
import { LogoutButton } from './LogoutButton';

interface AdminHeaderProps {
  title: string;
  subtitle: string | React.ReactNode;
  adminProfile?: {
    fullName: string;
    avatarUrl: string | null;
  };
}

export function AdminHeader({ title, subtitle, adminProfile }: AdminHeaderProps) {
  const avatarUrl = adminProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminProfile?.fullName || 'Admin')}&background=01261f&color=fff&size=128`;

  return (
    <header className="flex justify-between items-center w-full mb-12 font-['Lexend'] font-medium">
      <div className="flex flex-col">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">
          {title}
        </h2>
        <div className="text-on-surface-variant font-body">
          {subtitle}
        </div>
      </div>
      <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-full shadow-sm">
        <LogoutButton />
        <button className="text-on-surface-variant px-6 py-2 rounded-full text-xs font-semibold hover:bg-surface-container-high transition-colors">
          Admin View
        </button>
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-md flex-shrink-0">
          <img
            className="w-full h-full object-cover"
            src={avatarUrl}
            alt={adminProfile?.fullName || 'Admin'}
          />
        </div>
      </div>
    </header>
  );
}
