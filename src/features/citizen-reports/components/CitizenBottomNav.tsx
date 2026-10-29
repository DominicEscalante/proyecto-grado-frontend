// Barra de Navegacion Inferior Ergonomica Mobile-First con Heroicons
// Estilo visual ligero: superficie blanca, borde fino y capsula suave verde institucional

import React from 'react';
import {
  SignalIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 py-1.5 px-3 sm:px-6 shadow-lg pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Reportar */}
        <button
          type="button"
          onClick={() => onTabChange('reportar')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'reportar'
              ? 'bg-emerald-50 text-[#143601] font-bold border border-emerald-200/70 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900 font-medium hover:bg-stone-50'
          }`}
        >
          <SignalIcon
            className={`w-4 h-4 ${
              activeTab === 'reportar' ? 'stroke-[2.4] text-[#143601]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-xs tracking-tight">Reportar</span>
        </button>

        {/* Tab 2: Alertas */}
        <button
          type="button"
          onClick={() => onTabChange('alertas')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'alertas'
              ? 'bg-emerald-50 text-[#143601] font-bold border border-emerald-200/70 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900 font-medium hover:bg-stone-50'
          }`}
        >
          <div className="relative">
            <ClipboardDocumentListIcon
              className={`w-4 h-4 ${
                activeTab === 'alertas' ? 'stroke-[2.4] text-[#143601]' : 'stroke-[1.8]'
              }`}
            />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-xs tracking-tight">Alertas</span>
        </button>

        {/* Tab 3: Perfil */}
        <button
          type="button"
          onClick={() => onTabChange('perfil')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'perfil'
              ? 'bg-emerald-50 text-[#143601] font-bold border border-emerald-200/70 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900 font-medium hover:bg-stone-50'
          }`}
        >
          <UserCircleIcon
            className={`w-4 h-4 ${
              activeTab === 'perfil' ? 'stroke-[2.4] text-[#143601]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-xs tracking-tight">Perfil</span>
        </button>
      </div>
    </nav>
  );
};
