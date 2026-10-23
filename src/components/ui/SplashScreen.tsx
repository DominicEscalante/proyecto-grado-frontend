import React from 'react';
import { AppLogo } from './AppLogo.js';
import { MountainBackground } from './MountainBackground.js';

export interface SplashScreenProps {
  message?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  message = 'Iniciando sistema de respuesta...',
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between text-white select-none px-6 py-12"
      style={{
        background: 'linear-gradient(180deg, #143601 0%, #1a4301 45%, #245501 85%, #143601 100%)',
      }}
    >
      <MountainBackground />

      {/* Espaciador superior */}
      <div className="w-full flex justify-end">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
          GAMLP · 2026
        </span>
      </div>

      {/* Centro: Logo con animacion */}
      <div className="relative z-10 flex flex-col items-center">
        <AppLogo size={92} animated={true} />

        <div className="mt-5 text-center animate-fadeIn">
          <h1 className="text-2xl font-extrabold tracking-wider uppercase text-white font-sans drop-shadow-sm">
            SOS La Paz
          </h1>
          <p className="text-white/70 text-xs font-medium tracking-wide mt-1">
            Policía · Bomberos · Ciudadanía
          </p>
        </div>
      </div>

      {/* Pie de pantalla: Estado de carga */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
        </div>
        <p className="text-[11px] font-medium tracking-wider text-white/50">
          {message}
        </p>
      </div>
    </div>
  );
};
