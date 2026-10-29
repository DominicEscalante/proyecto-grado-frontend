// Selector de Institucion de Alto Contraste en 2 Columnas (Policia / Bomberos)
// Patron Triage de 1 toque con Heroicons y verde institucional #143601

import React from 'react';
import { ShieldCheckIcon, FireIcon } from '@heroicons/react/24/outline';
import { InstitucionDestino } from '../types/citizen-reports.types.js';

interface InstitutionSelectorProps {
  selected: InstitucionDestino;
  onSelect: (inst: InstitucionDestino) => void;
  disabled?: boolean;
}

export const InstitutionSelector: React.FC<InstitutionSelectorProps> = ({
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full select-none">
      {/* 1. Tarjeta Policia */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('POLICIA')}
        className={`relative flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl transition-all duration-150 cursor-pointer active:scale-[0.98] ${
          selected === 'POLICIA'
            ? 'bg-[#143601] text-white shadow-sm ring-2 ring-[#143601]/20 border-2 border-[#143601]'
            : 'bg-white text-stone-700 border-2 border-stone-200/90 hover:border-stone-300 hover:bg-stone-50/80'
        }`}
      >
        <ShieldCheckIcon
          className={`w-7 h-7 mb-1 transition-transform ${
            selected === 'POLICIA' ? 'text-white stroke-[2.2] scale-105' : 'text-stone-600 stroke-[1.8]'
          }`}
        />
        <span className="text-xs font-black tracking-wider uppercase">
          POLICÍA
        </span>
      </button>

      {/* 2. Tarjeta Bomberos */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('BOMBEROS')}
        className={`relative flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl transition-all duration-150 cursor-pointer active:scale-[0.98] ${
          selected === 'BOMBEROS'
            ? 'bg-[#143601] text-white shadow-sm ring-2 ring-[#143601]/20 border-2 border-[#143601]'
            : 'bg-white text-stone-700 border-2 border-stone-200/90 hover:border-stone-300 hover:bg-stone-50/80'
        }`}
      >
        <FireIcon
          className={`w-7 h-7 mb-1 transition-transform ${
            selected === 'BOMBEROS' ? 'text-white stroke-[2.2] scale-105' : 'text-stone-600 stroke-[1.8]'
          }`}
        />
        <span className="text-xs font-black tracking-wider uppercase">
          BOMBEROS
        </span>
      </button>
    </div>
  );
};
