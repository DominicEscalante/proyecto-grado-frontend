// Pestana de Perfil de Ciudadano Autenticado

import React from 'react';
import { PasskeyAction } from '../../auth/components/PasskeyAction.js';
import { useAuth } from '../../../context/AuthContext.js';
import { ShieldCheck, LogOut, Phone, Mail, IdCard, MapPin } from 'lucide-react';

export const CitizenProfileTab: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto grid w-full max-w-6xl items-start gap-4 pb-20 animate-fadeIn md:pb-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
      <div className="min-w-0 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 rounded-full bg-[#143601] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {user?.nombres?.charAt(0) || user?.name?.charAt(0) || 'C'}
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-sm sm:text-base font-bold text-stone-900">
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

        <div className="grid gap-2 border-t border-stone-100 pt-3 text-sm sm:grid-cols-2 sm:gap-x-5">
          <div className="grid min-w-0 gap-1 py-2">
            <span className="text-stone-500 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 shrink-0" />
              Cédula de Identidad:
            </span>
            <span className="break-words font-mono font-bold text-stone-800">
              {user?.ci || 'No disponible'}
            </span>
          </div>

          <div className="grid min-w-0 gap-1 py-2">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              Celular:
            </span>
            <span className="break-words font-mono font-bold text-stone-800">
              {user?.telefono ? `+591 ${user.telefono}` : 'No registrado'}
            </span>
          </div>

          <div className="grid min-w-0 gap-1 py-2">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              Correo Electrónico:
            </span>
            <span className="break-words text-stone-800">
              {user?.email || 'No disponible'}
            </span>
          </div>

          <div className="grid min-w-0 gap-1 py-2">
            <span className="text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              Jurisdicción:
            </span>
            <span className="font-medium text-stone-800">
              Municipio de La Paz
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-3">
        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200/80 space-y-2">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Líneas de Auxilio Inmediato
          </h3>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            <a
              href="tel:110"
              className="p-3 rounded-xl bg-white border border-stone-200 text-center font-mono font-bold text-xs text-[#143601] hover:bg-stone-50 transition-colors shadow-xs"
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

        <PasskeyAction mode="enroll" />
        <button
          type="button"
          onClick={logout}
          className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión Segura</span>
        </button>
      </div>
    </div>
  );
};
