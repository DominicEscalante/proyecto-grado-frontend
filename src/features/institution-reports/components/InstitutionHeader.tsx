import React from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ClockIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext.js';

export const InstitutionHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const name = (user?.rango ? `${user.rango} ` : '') +
    (user?.name || (user?.nombres ? `${user.nombres} ${user.apellidos || ''}`.trim() : '') || 'Sargento Pedro Mamani');
  const isBomberos = user?.institucion === 'BOMBEROS' || user?.rol_id === 3;
  const institution = isBomberos ? 'Bomberos' : 'Policía Boliviana';

  return (
    <header className={`h-16 shrink-0 border-b border-white/15 px-4 sm:px-6 flex items-center justify-between z-30 backdrop-blur-md ${isBomberos ? 'bg-[#c42348]' : 'bg-[#143601]'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/operador/emergencias" className="text-lg font-extrabold tracking-tight text-white">AMPAR</Link>
        <span className="hidden sm:inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">{institution}</span>
      </div>
      <nav aria-label="Navegación del operador" className="hidden md:flex items-center gap-1">
        <Link to="/operador/emergencias" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-sm font-semibold text-white"><MapIcon className="h-4 w-4" />Despacho</Link>
        <button type="button" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white"><ChartBarIcon className="h-4 w-4" />Analítica</button>
        <button type="button" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white"><ClockIcon className="h-4 w-4" />Historial</button>
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/90"><span className="h-2 w-2 rounded-full bg-emerald-300" />En línea</span>
        <button type="button" aria-label="Alertas" className="relative rounded-lg p-2 text-white/85 hover:bg-white/10 hover:text-white"><BellIcon className="h-5 w-5" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" /></button>
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg p-1.5 hover:bg-white/10">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/15 text-xs font-bold text-white">{name.split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase()}</span>
            <span className="hidden lg:block max-w-40 truncate text-sm font-semibold text-white">{name}</span><ChevronDownIcon className="h-4 w-4 text-white/75" />
          </summary>
          <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-stone-200 bg-[#F8FAF8] p-3 shadow-lg">
            <p className="truncate text-sm font-semibold text-stone-900">{name}</p><p className="mb-2 text-xs text-stone-500">{institution}</p>
            <button type="button" onClick={() => void logout()} className="w-full rounded-lg px-2 py-2 text-left text-sm text-red-700 hover:bg-red-50">Cerrar sesión</button>
          </div>
        </details>
      </div>
    </header>
  );
};
