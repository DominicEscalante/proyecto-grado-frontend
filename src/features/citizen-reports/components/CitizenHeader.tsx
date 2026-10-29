// Encabezado superior compacto para la vista ciudadana con estado GPS integrado
// Elimina la barra verde suelta y mantiene ergonomia mobile-first limpia sin emojis.

import React from 'react';
import { AppLogo } from '../../../components/ui/AppLogo.js';
import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { GpsLocationState } from '../types/citizen-reports.types.js';

interface CitizenHeaderProps {
  gps: GpsLocationState & {
    sincronizarGps: () => void;
    usarCoordenadasPruebaLaPaz: () => void;
  };
  onGoHome?: () => void;
}

export const CitizenHeader: React.FC<CitizenHeaderProps> = ({ gps, onGoHome }) => {
  const isSync = gps.status === 'synchronized' && gps.coords;
  const isLocating = gps.status === 'obtaining';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#143601] backdrop-blur-md border-b border-white/15 px-3.5 sm:px-4 py-2.5 shadow-2xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Marca: Isotipo en verde institucional + Ampar / Sistema de Emergencias */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="Ampar - Sistema de Emergencias"
        >
          <AppLogo size={26} color="#ffffff" showText={false} />
          <div className="flex flex-col justify-center">
            <h1 className="text-base font-black tracking-tight text-white leading-none group-hover:text-emerald-100 transition-colors">
              Ampar
            </h1>
            <p className="text-[10px] text-white/70 font-medium tracking-tight leading-tight mt-0.5">
              Sistema de Emergencias
            </p>
          </div>
        </div>

        {/* Píldora de Estado GPS Integrada (Sustituye a la barra verde suelta) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            onClick={gps.sincronizarGps}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold select-none transition-all cursor-pointer ${
              isSync
                ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
                : 'bg-amber-50 border-amber-200/80 text-amber-800'
            }`}
            title={
              isSync
                ? `GPS Sincronizado (${gps.coords?.latitud.toFixed(4)}, ${gps.coords?.longitud.toFixed(4)}) - Toca para actualizar`
                : 'Buscando señal GPS... Toca para sincronizar'
            }
          >
            <MapPinIcon className={`w-3.5 h-3.5 shrink-0 ${isSync ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isSync ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-medium leading-none">
              {isLocating ? 'Ubicando...' : isSync ? 'GPS Sincronizado' : 'Sin GPS'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                gps.sincronizarGps();
              }}
              className="p-0.5 rounded-full hover:bg-stone-200/60 transition-colors ml-0.5 text-stone-600"
              title="Recalibrar ubicación GPS"
              aria-label="Recalibrar ubicación GPS"
            >
              <ArrowPathIcon className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
