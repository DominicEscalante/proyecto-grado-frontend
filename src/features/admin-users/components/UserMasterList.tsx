import React from 'react';
import {
  ChevronRightIcon,
  ShieldCheckIcon,
  FireIcon,
  KeyIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import {
  AdminUserItem,
  RoleFilter,
  StatusFilter,
  UserMetrics,
} from '../types/admin-users.types.js';
import { getInitials } from '../utils/user-formatters.js';
import { Toolbar } from './Toolbar.js';

interface UserMasterListProps {
  users: AdminUserItem[];
  selectedUser: AdminUserItem | null;
  onSelectUser: (user: AdminUserItem) => void;
  loading: boolean;
  totalCount: number;
  metrics: UserMetrics;
  activeFilter: RoleFilter;
  onSelectFilter: (filter: RoleFilter) => void;
  statusFilter: StatusFilter;
  onSelectStatusFilter: (status: StatusFilter) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export const UserMasterList: React.FC<UserMasterListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  loading,
  totalCount,
  metrics,
  activeFilter,
  onSelectFilter,
  statusFilter,
  onSelectStatusFilter,
  searchTerm,
  onSearchChange,
  onRefresh,
}) => {
  // Render badge para rol / institución sobre fondo blanco con identidad sutil
  const renderRoleBadge = (u: AdminUserItem) => {
    const rolId = u.rol?.rolId;

    if (rolId === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
          <span>Policía</span>
          {u.rango && <span className="opacity-80 font-normal">· {u.rango}</span>}
        </span>
      );
    }

    if (rolId === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <FireIcon className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span>Bomberos</span>
          {u.rango && <span className="opacity-80 font-normal">· {u.rango}</span>}
        </span>
      );
    }

    if (rolId === 4) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#143601] text-white shadow-2xs">
          <KeyIcon className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
          <span>Administrador</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
        <UserIcon className="w-3.5 h-3.5 shrink-0 text-stone-500" />
        <span>Ciudadano</span>
      </span>
    );
  };

  // Render badge de estado
  const renderStatus = (active: boolean) => {
    if (active) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span>Activo</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs text-red-800 bg-red-50 border border-red-200 font-semibold">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        <span>Suspendido</span>
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-stone-200 overflow-hidden shadow-xs flex flex-col">
      {/* 1. Header Superior Unificado: Toolbar integrada directamente dentro de la tarjeta */}
      <Toolbar
        metrics={metrics}
        activeFilter={activeFilter}
        onSelectFilter={onSelectFilter}
        statusFilter={statusFilter}
        onSelectStatusFilter={onSelectStatusFilter}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onRefresh={onRefresh}
        loading={loading}
      />

      {/* 2. Vista Desktop: Tabla de Alta Densidad con Altura Fija y Cabecera Sticky con border-y */}
      <div className="hidden md:block max-h-[580px] overflow-y-auto overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
            <tr className="border-y border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider bg-[#F8FAFC]">
              <th className="py-3 px-4 w-28 bg-[#F8FAFC]">CI / ID</th>
              <th className="py-3 px-4 min-w-[260px] bg-[#F8FAFC]">Usuario / Nombre</th>
              <th className="py-3 px-4 w-36 bg-[#F8FAFC]">Contacto</th>
              <th className="py-3 px-4 bg-[#F8FAFC]">Rol / Institución</th>
              <th className="py-3 px-4 w-28 bg-[#F8FAFC]">Estado</th>
              <th className="py-3 px-3 w-10 text-center bg-[#F8FAFC]" aria-label="Selección" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-stone-400">
                  <div className="w-6 h-6 mx-auto border-2 border-[#245501] border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs">Cargando directorio de usuarios...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-stone-400">
                  <UserIcon className="w-8 h-8 mx-auto text-stone-400 mb-2 stroke-1" />
                  <p className="text-sm font-semibold text-stone-800">No se encontraron usuarios</p>
                  <p className="text-xs text-stone-500">
                    Intenta cambiar los términos de búsqueda o los filtros de rol/estado.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelected = selectedUser?.id === u.id;

                return (
                  <tr
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`cursor-pointer transition-colors border-l-4 ${
                      isSelected
                        ? 'border-l-[#245501] bg-[#f0f7ec]'
                        : 'border-l-transparent hover:bg-stone-50/80'
                    }`}
                  >
                    {/* CI / ID */}
                    <td className="py-3 px-4 font-mono text-stone-700 text-xs font-semibold whitespace-nowrap">
                      {u.ci}
                      {u.complemento && (
                        <span className="text-[10px] text-stone-500 font-normal">-{u.complemento}</span>
                      )}
                    </td>

                    {/* USUARIO / NOMBRE con min-w-[260px] */}
                    <td className="py-3 px-4 min-w-[260px]">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar circular */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                            isSelected
                              ? 'bg-[#245501] text-white border-[#245501]'
                              : 'bg-[#245501]/15 text-[#143601] border-[#245501]/25'
                          }`}
                        >
                          {getInitials(u.name || `${u.nombres} ${u.apellidos}`)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#143601] truncate max-w-[260px]">
                            {u.name || `${u.nombres} ${u.apellidos}`}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate max-w-[260px]">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACTO con Icono Sutil PhoneIcon */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center text-stone-600 font-mono text-xs">
                        <PhoneIcon className="w-3.5 h-3.5 text-stone-400 mr-1.5 shrink-0" />
                        <span>{u.telefono || 'Sin teléfono'}</span>
                      </div>
                    </td>

                    {/* ROL / INSTITUCIÓN */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderRoleBadge(u)}
                    </td>

                    {/* ESTADO */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatus(u.estadoCuenta)}
                    </td>

                    {/* SELECCIÓN / ACCIÓN RÁPIDA */}
                    <td className="py-3 px-3 text-center">
                      <ChevronRightIcon
                        className={`w-4 h-4 mx-auto transition-transform ${
                          isSelected
                            ? 'text-[#245501] translate-x-0.5'
                            : 'text-stone-300'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Vista Móvil: Tarjetas Táctiles Interactivas */}
      <div className="block md:hidden max-h-[520px] overflow-y-auto custom-scrollbar p-3 space-y-2.5">
        {loading && users.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <div className="w-6 h-6 mx-auto border-2 border-[#245501] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Cargando directorio...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <UserIcon className="w-8 h-8 mx-auto text-stone-400 mb-2 stroke-1" />
            <p className="text-sm font-semibold text-stone-800">No se encontraron cuentas</p>
            <p className="text-xs text-stone-500">Ajusta los filtros de búsqueda.</p>
          </div>
        ) : (
          users.map((u) => {
            const isSelected = selectedUser?.id === u.id;

            return (
              <div
                key={u.id}
                onClick={() => onSelectUser(u)}
                role="button"
                tabIndex={0}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer active:scale-[0.99] ${
                  isSelected
                    ? 'bg-[#f0f7ec] border-[#245501] shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#245501]/15 border border-[#245501]/25 flex items-center justify-center text-xs font-bold text-[#143601] shrink-0">
                      {getInitials(u.name || `${u.nombres} ${u.apellidos}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#143601] truncate">
                        {u.name || `${u.nombres} ${u.apellidos}`}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-stone-400 shrink-0" />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-stone-600">
                      CI: {u.ci}
                    </span>
                    {renderRoleBadge(u)}
                  </div>
                  <div>{renderStatus(u.estadoCuenta)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Pie de la Lista (Contador Fijo) */}
      <div className="px-4 py-2.5 border-t border-stone-200 bg-[#F8FAFC] flex items-center justify-between text-xs text-stone-500">
        <span>
          Mostrando <strong className="text-[#143601] font-mono">{users.length}</strong> de{' '}
          <strong className="text-[#143601] font-mono">{totalCount}</strong> cuentas
        </span>
        <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
          Selecciona una fila para inspeccionar
        </span>
      </div>
    </div>
  );
};
