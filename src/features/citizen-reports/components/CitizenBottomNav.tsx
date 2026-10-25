// Barra de Navegacion Inferior para Movil segun el Mockup

import React from 'react';
import { Asterisk, Bell, User } from 'lucide-react';
import { CitizenTab } from '../types/citizen-reports.types.js';

interface CitizenBottomNavProps {
  activeTab: CitizenTab;
  onTabChange: (tab: CitizenTab) => void;
  unreadAlertsCount?: number;
}

export const CitizenBottomNav: React.FC<CitizenBottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadAlertsCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 py-2 px-6 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Reportar (Activo en Mockup con Pastilla Oscura) */}
        <button
          type="button"
          onClick={() => onTabChange('reportar')}
          className={`relative flex flex-col items-center justify-center transition-all select-none ${
            activeTab === 'reportar'
              ? 'px-5 py-1.5 rounded-full bg-[#143601] text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Asterisk
            className={`w-5 h-5 ${
              activeTab === 'reportar' ? 'stroke-[3] text-white' : 'stroke-[2]'
            }`}
          />
          <span className="text-[11px] font-bold tracking-tight">Reportar</span>
        </button>

        {/* Tab 2: Alertas */}
        <button
          type="button"
          onClick={() => onTabChange('alertas')}
          className={`relative flex flex-col items-center justify-center transition-all select-none ${
            activeTab === 'alertas'
              ? 'px-5 py-1.5 rounded-full bg-[#143601] text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Bell
              className={`w-5 h-5 ${
                activeTab === 'alertas' ? 'stroke-[2.5] text-white' : 'stroke-[2]'
              }`}
            />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight">Alertas</span>
        </button>

        {/* Tab 3: Perfil */}
        <button
          type="button"
          onClick={() => onTabChange('perfil')}
          className={`relative flex flex-col items-center justify-center transition-all select-none ${
            activeTab === 'perfil'
              ? 'px-5 py-1.5 rounded-full bg-[#143601] text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <User
            className={`w-5 h-5 ${
              activeTab === 'perfil' ? 'stroke-[2.5] text-white' : 'stroke-[2]'
            }`}
          />
          <span className="text-[11px] font-bold tracking-tight">Perfil</span>
        </button>
      </div>
    </nav>
  );
};
