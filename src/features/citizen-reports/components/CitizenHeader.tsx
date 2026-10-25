// Encabezado superior institucional para la vista ciudadana (Mobile First)

import React from 'react';
import { Shield } from 'lucide-react';

interface CitizenHeaderProps {
  onGoHome?: () => void;
}

export const CitizenHeader: React.FC<CitizenHeaderProps> = ({ onGoHome }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-stone-200/80 px-4 py-2 flex items-center justify-between shadow-2xs">
      <div 
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={onGoHome}
      >
        {/* Icono de Cruz / Escudo de Emergencias */}
        <div className="w-7 h-7 rounded-lg bg-[#143601] flex items-center justify-center text-white shadow-2xs shrink-0">
          <div className="relative flex items-center justify-center">
            <Shield className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="absolute text-[10px] font-black text-white leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              +
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-sm sm:text-base font-black tracking-wide text-[#143601] leading-none">
            Ampar
          </h1>
          <p className="text-[10px] text-stone-500 font-medium tracking-tight leading-tight mt-0.5">
            Sistema de Emergencias
          </p>
        </div>
      </div>
    </header>
  );
};
