import React from 'react';

/**
 * Widget Météo - Tennis Club du François
 * Affiche les conditions idéales pour jouer à la Martinique !
 */
export function WeatherWidget() {
  return (
    <div className="bg-surface-container-high rounded-xl p-6 flex flex-col justify-between h-full min-h-[160px] shadow-sm">
      <div className="flex justify-between items-start">
        <span className="material-symbols-outlined text-primary text-3xl">wb_sunny</span>
        <span className="text-2xl font-headline font-bold text-primary">28°C</span>
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface-variant leading-tight">Météo Le François</p>
        <p className="text-xs text-on-surface-variant/70 mt-1">Conditions parfaites pour la terre battue</p>
      </div>
    </div>
  );
}
