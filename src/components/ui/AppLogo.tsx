import React from 'react';

export interface AppLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
  showText?: boolean;
  title?: string;
  subtitle?: string;
  color?: string;
}

/**
 * Logotipo oficial de AMPAR: Sistema de Respuesta y Emergencias.
 * Simboliza la union indisoluble entre Policia, Bomberos y Ciudadania.
 * Trazo en color parametrizable (por defecto #ffffff de alto contraste).
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 72,
  animated = false,
  showText = false,
  title = 'AMPAR',
  subtitle = 'Sistema de Respuesta a Emergencias',
  color = '#ffffff',
}) => {
  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div
        className={`inline-flex items-center justify-center ${
          animated ? 'animate-pulse' : ''
        }`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Lazo Izquierdo: Ciudadano y Alerta */}
          <path
            d="M38 32 C23 32, 14 41, 14 51 C14 62, 23 70, 37 70 C48 70, 55 62, 60 55 C65 48, 72 40, 83 40 C91 40, 96 45, 96 52"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Lazo Derecho: Proteccion Policial y Rescate Bomberos */}
          <path
            d="M62 68 C77 68, 86 59, 86 49 C86 38, 77 30, 63 30 C52 30, 45 38, 40 45 C35 52, 28 60, 17 60 C9 60, 4 55, 4 48"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Vertice Central: Escudo y Llama fusionados */}
          <path
            d="M50 16 C53 23, 58 28, 58 33 C58 38, 54 41, 50 41 C46 41, 42 38, 42 33 C42 28, 47 23, 50 16 Z"
            fill={color}
          />

          {/* Nucleo Central */}
          <circle cx="50" cy="50" r="4.5" fill={color} />
        </svg>
      </div>

      {showText && (
        <div className="mt-3 text-center">
          <h1 className="text-xl font-extrabold tracking-widest uppercase text-white font-sans drop-shadow-sm">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/70 text-[11px] font-medium tracking-wide mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
