// Pestana de Perfil de Ciudadano Autenticado

import React from 'react';
import { useAuth } from '../../../context/AuthContext.js';
import { ShieldCheck, LogOut, Phone, Mail, IdCard, MapPin } from 'lucide-react';

export const CitizenProfileTab: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full space-y-4 pb-20 animate-fadeIn">
      {/* Tarjeta de Identidad Ciudadana */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#143601] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {user?.nombres?.charAt(0) || user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-900">
              {user?.nombres
                ? `${user.nombres} ${user.apellidos || ''}`
                : user?.name || 'Ciudadano Registrado'}
            </h2>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identidad Verificada</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5" />
              Cédula de Identidad:
            </span>
            <span className="font-mono font-bold text-stone-800">
              {user?.ci || 'No disponible'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Celular:
            </span>
            <span className="font-mono font-bold text-stone-800">
              {user?.telefono ? `+591 ${user.telefono}` : 'No registrado'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Correo Electrónico:
            </span>
            <span className="font-mono text-stone-800 truncate max-w-[180px]">
              {user?.email || 'No disponible'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Jurisdicción:
            </span>
            <span className="font-medium text-stone-800">
              Municipio de La Paz
            </span>
          </div>
        </div>
      </div>

      {/* Numeros de Emergencia Directos */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200/80 space-y-2">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Líneas de Auxilio Inmediato
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:110"
            className="p-2.5 rounded-xl bg-white border border-stone-200 text-center font-mono font-bold text-xs text-[#143601] hover:bg-stone-50 transition-colors shadow-xs"
          >
            110 Policía
          </a>
          <a
            href="tel:119"
            className="p-2.5 rounded-xl bg-white border border-stone-200 text-center font-mono font-bold text-xs text-[#d9534f] hover:bg-stone-50 transition-colors shadow-xs"
          >
            119 Bomberos
          </a>
        </div>
      </div>

      {/* Boton Cerrar Sesion */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar Sesión Segura</span>
      </button>
    </div>
  );
};
