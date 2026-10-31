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
 * Isotipo Enlace de AMPAR: coordinacion entre equipos de respuesta.
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
          viewBox="60 80 208 192"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
          role="img"
          aria-label="Logo AMPAR, enlace de equipos de respuesta"
        >
          <path
            d="M80 176c24-40 52-60 84-60s60 20 84 60c-24 40-52 60-84 60s-60-20-84-60z"
            stroke={color}
            strokeWidth="14"
          />
          <path
            d="M95 210c32-48 65-72 99-72 17 0 35 6 53 18"
            stroke={color === '#ffffff' ? '#aad576' : '#538d22'}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <circle cx="164" cy="176" r="17" fill={color === '#ffffff' ? '#aad576' : '#538d22'} />
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
