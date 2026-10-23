/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090D16', // Fondo neutro oscuro base
        surface: {
          DEFAULT: '#111827',   // Superficie principal neutra (cards/containers)
          elevated: '#172033',  // Superficie elevada / hover / active row
          subtle: '#0D1322',    // Superficie sutil / fondo de inputs y tablas
          card: '#131C2E',      // Superficie de tarjetas
        },
        card: {
          DEFAULT: '#111827',
          hover: '#172033',
          border: '#1F2937',
        },
        border: {
          DEFAULT: '#1F2937',   // Borde sutil neutro
          subtle: '#161F2E',
          strong: '#374151',
          active: '#538d22',    // Borde de seleccion activo primario
        },
        primary: {
          DEFAULT: '#538d22',   // Tono primario / acento principal de la paleta
          hover: '#73a942',
          light: '#aad576',
          dark: '#245501',
          subtle: 'rgba(83, 141, 34, 0.12)',
          border: 'rgba(83, 141, 34, 0.25)',
        },
        muted: {
          DEFAULT: '#9CA3AF',   // Texto atenuado
          foreground: '#6B7280', // Texto secundario / iconos
          border: '#1F2937',
        },
        police: {
          DEFAULT: '#10B981',
          subtle: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.25)',
        },
        fire: {
          DEFAULT: '#F59E0B',
          subtle: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.25)',
        },
        danger: {
          DEFAULT: '#EF4444',
          subtle: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.25)',
        },
        emergencia: {
          darkest: '#143601', // Color 1 base profunda
          dark: '#1a4301',    // Color 2 tono intermedio
          medium: '#245501',  // Color 3 tono medio
          grad1: '#538d22',   // Color 4
          grad2: '#73a942',   // Color 5
          grad3: '#aad576',   // Color 6
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        drawerSlideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        drawerBottomIn: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        slideInRight: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideInLeft: 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        drawerSlideIn: 'drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        drawerBottomIn: 'drawerBottomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
