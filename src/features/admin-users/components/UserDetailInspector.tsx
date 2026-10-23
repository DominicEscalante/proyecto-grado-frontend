import React, { useState } from 'react';
import {
  UserIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  PencilSquareIcon,
  KeyIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  FireIcon,
  CheckBadgeIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { AdminUserItem } from '../types/admin-users.types.js';
import { getInitials, formatDate } from '../utils/user-formatters.js';
import { sileo } from 'sileo';

interface UserDetailInspectorProps {
  user: AdminUserItem | null;
  isMobileDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onEdit: (user: AdminUserItem) => void;
  onResetPassword: (user: AdminUserItem) => void;
  onToggleStatus: (user: AdminUserItem) => void;
}

export const UserDetailInspector: React.FC<UserDetailInspectorProps> = ({
  user,
  isMobileDrawerOpen,
  onCloseDrawer,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => {
  const [copiedField, setCopiedField] = useState<'ci' | 'email' | null>(null);

  const handleCopy = (text: string, field: 'ci' | 'email') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    sileo.info({
      title: field === 'ci' ? 'CI Copiado' : 'Correo Copiado',
      description: text,
    });
    setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  };

  // Renderizador del contenido del inspector
  const renderContent = (isMobile = false) => {
    if (!user) {
      return (
        <div className="py-20 px-6 text-center text-stone-400 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-3">
            <UserIcon className="w-6 h-6 text-stone-400 stroke-1" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-1">
            Inspector de Cuenta
          </h3>
          <p className="text-xs text-stone-500 max-w-[260px] mx-auto">
            Selecciona una cuenta de la lista para inspeccionar sus credenciales, permisos y realizar acciones directas.
          </p>
        </div>
      );
    }

    const rolId = user.rol?.rolId;
    const isSuspended = !user.estadoCuenta;

    return (
      <div className="flex flex-col">
        {/* 1. Franja Superior Sutil con Fondo al 6% de Opacidad del Verde Institucional */}
        <div className="bg-[#245501]/[0.06] border-b border-stone-200/70 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full bg-[#245501]/15 border border-[#245501]/25 flex items-center justify-center text-base font-extrabold text-[#143601] shadow-2xs shrink-0">
                {getInitials(user.name || `${user.nombres} ${user.apellidos}`)}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#143601] truncate">
                  {user.name || `${user.nombres} ${user.apellidos}`}
                </h2>
                <p className="text-xs text-stone-500 font-mono truncate">{user.email}</p>
              </div>
            </div>

            {isMobile && (
              <button
                type="button"
                onClick={onCloseDrawer}
                className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
                title="Cerrar inspector"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Badges de Rol, Estado y SEGIP con rounded-full */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {/* Badge de Rol */}
            {rolId === 2 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Policía</span>
              </span>
            )}
            {rolId === 3 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <FireIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>Bomberos</span>
              </span>
            )}
            {rolId === 4 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#143601] text-white shadow-2xs">
                <KeyIcon className="w-3.5 h-3.5 text-emerald-300" />
                <span>Administrador</span>
              </span>
            )}
            {rolId === 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                <span>Ciudadano</span>
              </span>
            )}

            {/* Badge de Estado Cuenta */}
            {user.estadoCuenta ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Cuenta Activa</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                <span>Suspendida</span>
              </span>
            )}

            {/* Verificación SEGIP */}
            {user.identidadVerificada ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-white border border-emerald-200 shadow-2xs">
                <CheckBadgeIcon className="w-3 h-3 text-emerald-600" />
                <span>SEGIP Verificado</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-stone-600 bg-white border border-stone-200 shadow-2xs">
                <span>SEGIP Pendiente</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Cuerpo del Inspector */}
        <div className="p-5 space-y-5">
          {/* Ficha de Datos Clave-Valor con Iconos Alineados a la Izquierda y divide-y */}
          <div className="rounded-lg bg-[#F8FAFC] border border-stone-200 divide-y divide-stone-200/60 overflow-hidden text-xs">
            {/* CI con Copiado */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-stone-600 font-medium text-xs">
                <IdentificationIcon className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Cédula de Identidad (CI):</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[#143601] font-bold text-xs">
                  {user.ci}
                  {user.complemento ? `-${user.complemento}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${user.ci}${user.complemento ? `-${user.complemento}` : ''}`,
                      'ci'
                    )
                  }
                  className="p-1 rounded hover:bg-white text-stone-400 hover:text-[#143601] border border-transparent hover:border-stone-200 transition-colors"
                  title="Copiar CI"
                >
                  {copiedField === 'ci' ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-0.5">
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado</span>
                    </span>
                  ) : (
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Correo con Copiado */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-stone-600 font-medium text-xs">
                <EnvelopeIcon className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Correo Institucional:</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[#143601] truncate max-w-[140px] font-mono text-[11px] font-semibold">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.email, 'email')}
                  className="p-1 rounded hover:bg-white text-stone-400 hover:text-[#143601] border border-transparent hover:border-stone-200 transition-colors shrink-0"
                  title="Copiar correo"
                >
                  {copiedField === 'email' ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-0.5">
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado</span>
                    </span>
                  ) : (
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Teléfono */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-stone-600 font-medium text-xs">
                <PhoneIcon className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Teléfono Celular:</span>
              </div>
              <span className="font-mono text-[#143601] font-semibold">{user.telefono || 'No registrado'}</span>
            </div>

            {/* Rango e Institución (si aplica) */}
            {user.institucion && (
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-stone-600 font-medium text-xs">
                  <BuildingOffice2Icon className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Institución / Rango:</span>
                </div>
                <span className="text-[#143601] font-bold">
                  {user.institucion} {user.rango ? `· ${user.rango}` : ''}
                </span>
              </div>
            )}

            {/* Fecha de Alta */}
            <div className="p-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-stone-600 font-medium">
                <CalendarIcon className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Fecha de Alta:</span>
              </div>
              <span className="text-stone-600 font-mono text-[11px]">
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>

          {/* 3. Acciones de Administración (Grid de 2 Columnas + Botón de Peligro Limpio Abajo) */}
          <div className="space-y-2.5 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-0.5">
              Acciones de Administración
            </p>

            {/* Grid 2 Columnas: Editar y Restablecer */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 hover:border-[#245501] text-[#143601] text-xs font-semibold shadow-2xs transition-all"
              >
                <PencilSquareIcon className="w-3.5 h-3.5 text-stone-500" />
                <span>Editar Info</span>
              </button>

              <button
                type="button"
                onClick={() => onResetPassword(user)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 hover:border-[#245501] text-[#143601] text-xs font-semibold shadow-2xs transition-all"
              >
                <KeyIcon className="w-3.5 h-3.5 text-[#245501]" />
                <span>Restablecer</span>
              </button>
            </div>

            {/* Suspender / Reactivar Ocupando Ancho Completo con Diseño Ejecutivo */}
            {isSuspended ? (
              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs transition-all"
              >
                <CheckCircleIcon className="w-4 h-4 text-emerald-700" />
                <span>Reactivar Acceso a la Cuenta</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50/50 hover:bg-red-100/80 border border-red-200 text-red-700 text-xs font-semibold shadow-2xs transition-all"
              >
                <NoSymbolIcon className="w-4 h-4 text-red-600" />
                <span>Suspender Cuenta de Usuario</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Vista Desktop: Panel Lateral Sticky en lg:col-span-4 */}
      <div className="hidden lg:block lg:sticky lg:top-6 rounded-xl bg-white border border-stone-200 overflow-hidden shadow-xs">
        {renderContent(false)}
      </div>

      {/* 2. Vista Móvil: Drawer Deslizable */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseDrawer}
          />

          {/* Drawer Sheet en Blanco */}
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white border-l border-stone-200 overflow-y-auto shadow-2xl animate-drawerSlideIn">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
