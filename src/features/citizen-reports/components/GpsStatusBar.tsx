// Banner de Estado de Sincronizacion GPS Ciudadana

import React, { useState } from 'react';
import { MapPin, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { GpsLocationState } from '../types/citizen-reports.types.js';

interface GpsStatusBarProps {
  gps: GpsLocationState & {
    sincronizarGps: () => void;
    usarCoordenadasPruebaLaPaz: () => void;
  };
}

export const GpsStatusBar: React.FC<GpsStatusBarProps> = ({ gps }) => {
  const [showDetails, setShowDetails] = useState(false);

  // 1. Estado Sincronizado (Mockup exacto)
  if (gps.status === 'synchronized' && gps.coords) {
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-xs transition-all">
        <div
          onClick={() => setShowDetails((prev) => !prev)}
          className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors shadow-2xs select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Localización GPS Sincronizada
            </span>
          </div>

          <div className="flex items-center gap-2">
            {gps.isSimulated && (
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono font-medium">
                Simulado La Paz
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                gps.sincronizarGps();
              }}
              title="Actualizar posición GPS"
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
            </button>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5 text-white/80" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            )}
          </div>
        </div>

        {/* Detalle Desplegable Opcional */}
        {showDetails && (
          <div className="mt-1 px-3.5 py-2 bg-emerald-950/90 border border-emerald-500/20 rounded-lg text-emerald-200 text-[11px] font-mono flex items-center justify-between">
            <div>
              <span>Lat: {gps.coords.latitud.toFixed(5)}</span> ·{' '}
              <span>Lng: {gps.coords.longitud.toFixed(5)}</span>
            </div>
            <div className="text-emerald-400 font-semibold">
              ±{gps.coords.precisionMetros}m precisión
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Estado Buscando Senal GPS
  if (gps.status === 'obtaining') {
    return (
      <div className="w-full bg-amber-500 text-white px-3.5 py-3 rounded-xl flex items-center justify-between shadow-xs animate-pulse">
        <div className="flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Obteniendo ubicación GPS del dispositivo...
          </span>
        </div>
        {import.meta.env.DEV && <button
          type="button"
          onClick={gps.usarCoordenadasPruebaLaPaz}
          className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md font-bold transition-colors uppercase tracking-wider"
        >
          Usar La Paz
        </button>}
      </div>
    );
  }

  // 3. Estado Error o Permiso Denegado
  return (
    <div className="w-full bg-rose-600 text-white p-3 rounded-xl shadow-xs space-y-2">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-white" />
        <div className="flex-1">
          <p className="text-xs font-bold leading-tight">
            No se pudo obtener la ubicación GPS
          </p>
          <p className="text-[11px] text-white/90 leading-tight pt-0.5">
            {gps.errorMessage || 'Verifica que los servicios de ubicación estén activados.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/20">
        <button
          type="button"
          onClick={gps.sincronizarGps}
          className="flex-1 py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reintentar GPS
        </button>
        {import.meta.env.DEV && <button
          type="button"
          onClick={gps.usarCoordenadasPruebaLaPaz}
          className="flex-1 py-1.5 px-3 rounded-lg bg-white text-rose-700 hover:bg-white/90 text-[11px] font-bold transition-colors"
        >
          Simular La Paz (Pruebas)
        </button>}
      </div>
    </div>
  );
};
