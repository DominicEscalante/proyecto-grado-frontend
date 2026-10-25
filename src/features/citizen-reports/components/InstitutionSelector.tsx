// Selector de Institucion Destino (Policia / Bomberos) con estilos del Mockup

import React from 'react';
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
    <div className="grid grid-cols-2 gap-3 w-full">
      {/* Boton Policia */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('POLICIA')}
        className={`relative flex flex-col items-center justify-center py-3 px-3 rounded-2xl transition-all duration-200 select-none shadow-2xs active:scale-[0.98] ${
          selected === 'POLICIA'
            ? 'bg-[#143601] text-white border-2 border-[#143601] shadow-xs ring-2 ring-[#538d22]/30'
            : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-stone-300'
        }`}
      >
        <div className="mb-1.5">
          {/* Icono de Escudo Policial */}
          <svg
            className={`w-8 h-8 transition-transform ${
              selected === 'POLICIA' ? 'scale-105' : 'text-stone-600'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polygon
              points="12 8 13.2 10.5 16 10.9 14 12.8 14.5 15.5 12 14.2 9.5 15.5 10 12.8 8 10.9 10.8 10.5 12 8"
              fill={selected === 'POLICIA' ? 'white' : 'currentColor'}
              stroke="none"
            />
          </svg>
        </div>
        <span className="text-xs font-extrabold tracking-wider uppercase">
          POLICÍA
        </span>
      </button>

      {/* Boton Bomberos */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('BOMBEROS')}
        className={`relative flex flex-col items-center justify-center py-3 px-3 rounded-2xl transition-all duration-200 select-none shadow-2xs active:scale-[0.98] ${
          selected === 'BOMBEROS'
            ? 'bg-[#d9534f] text-white border-2 border-[#d9534f] shadow-xs ring-2 ring-[#d9534f]/30'
            : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-stone-300'
        }`}
      >
        <div className="mb-1.5">
          {/* Icono de Carro de Bomberos */}
          <svg
            className={`w-8 h-8 transition-transform ${
              selected === 'BOMBEROS' ? 'scale-105' : 'text-stone-600'
            }`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* Cabina y chasis del camion */}
            <path d="M4 6C2.9 6 2 6.9 2 8V16C2 16.6 2.4 17 3 17H4C4 18.7 5.3 20 7 20C8.7 20 10 18.7 10 17H14C14 18.7 15.3 20 17 20C18.7 20 20 18.7 20 17H21C21.6 17 22 16.6 22 16V12L19 7H14V6H4ZM14 9H18.2L20 12H14V9ZM4 8H12V10H4V8ZM4 12H12V14H4V12ZM7 16C7.6 16 8 16.4 8 17C8 17.6 7.6 18 7 18C6.4 18 6 17.6 6 17C6 16.4 6.4 16 7 16ZM17 16C17.6 16 18 16.4 18 17C18 17.6 17.6 18 17 18C16.4 18 16 17.6 16 17C16 16.4 16.4 16 17 16Z" />
            {/* Sirena superior */}
            <rect x="7" y="3" width="4" height="2" rx="1" />
            {/* Escalera en el techo */}
            <rect x="13" y="3" width="7" height="2" rx="1" />
          </svg>
        </div>
        <span className="text-xs font-extrabold tracking-wider uppercase">
          BOMBEROS
        </span>
      </button>
    </div>
  );
};
