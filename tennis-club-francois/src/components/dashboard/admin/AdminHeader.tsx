import React from 'react';
import { LogoutButton } from './LogoutButton';

interface AdminHeaderProps {
  title: string;
  subtitle: string | React.ReactNode;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
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
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-md">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFGCvzom7rzEu-5FRVYU-mgSB30mbDOqJ1SAN1k97Z5zzKoy77D4L7htm8KWwGDK5HhmAUOvOlYSoplBQnaxJI4hgHLiHdH68L7aa9luZBDfyTdcp2LlgoN-_u9od4PfJyQjnVx1LXvDaEf0m5HRCwCPZvrBcHPSxf8yaFqXGxNIBNjQT1dwHwvUCFvUDa9fSnZaBffF6GkfFiL9hAXE0IcLDsB-09eLOrmyEBaqWtqeGs4sSRqHeYkkgnfglLtYTG8v9paV-zLsE"
            alt="Admin"
          />
        </div>
      </div>
    </header>
  );
}
