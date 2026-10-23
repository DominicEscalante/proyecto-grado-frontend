import React from 'react';
import {
  UsersIcon,
  UserIcon,
  ShieldCheckIcon,
  FireIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { RoleFilter, StatusFilter, UserMetrics } from '../types/admin-users.types.js';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select.js';

interface ToolbarProps {
  metrics: UserMetrics;
  activeFilter: RoleFilter;
  onSelectFilter: (filter: RoleFilter) => void;
  statusFilter: StatusFilter;
  onSelectStatusFilter: (status: StatusFilter) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  metrics,
  activeFilter,
  onSelectFilter,
  statusFilter,
  onSelectStatusFilter,
  searchTerm,
  onSearchChange,
  onRefresh,
  loading,
}) => {
  const roleTabs = [
    { id: 'ALL' as RoleFilter, label: 'Todos', count: metrics.total, icon: UsersIcon },
    { id: 'CITIZEN' as RoleFilter, label: 'Ciudadanos', count: metrics.citizens, icon: UserIcon },
    { id: 'POLICE' as RoleFilter, label: 'Policía', count: metrics.police, icon: ShieldCheckIcon },
    { id: 'FIREFIGHTER' as RoleFilter, label: 'Bomberos', count: metrics.firefighters, icon: FireIcon },
    { id: 'ADMIN' as RoleFilter, label: 'Admins', count: metrics.admins, icon: KeyIcon },
  ];

  return (
    <div className="p-3 sm:p-4 border-b border-stone-200 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      {/* 1. Izquierda: Segmented Control Unificado (Estilo Vercel/Linear con bg-stone-100 y tabs rounded-md) */}
      <div className="bg-stone-100 p-1 rounded-lg inline-flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
        {roleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all shrink-0 font-medium ${
                isActive
                  ? 'bg-white text-[#143601] font-bold shadow-xs border border-stone-200/50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-[#245501]' : 'text-stone-400'
                }`}
              />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#245501]/10 text-[#143601]'
                    : 'text-stone-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Derecha: Buscador, Select de Estado con ChevronDownIcon Limpio y Botón Refrescar */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full xl:w-auto">
        {/* Buscador sobre fondo claro */}
        <div className="relative flex-1 sm:w-60 min-w-[180px]">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar CI, nombre, correo o cel..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-7 py-1.5 rounded-lg bg-[#F8FAFC] border border-stone-200 text-xs text-[#143601] placeholder-stone-400 focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-stone-400 hover:text-stone-700"
              title="Limpiar búsqueda"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtro por Estado con Componente Shadcn/UI Select */}
        <Select
          value={statusFilter}
          onValueChange={(val) => onSelectStatusFilter(val as StatusFilter)}
        >
          <SelectTrigger className="w-[140px] shrink-0">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ALL">Estado: Todos</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
          </SelectContent>
        </Select>

        {/* Botón Refrescar */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-[#F8FAFC] border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-[#143601] transition-colors focus:outline-none shrink-0"
          title="Refrescar directorio"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#245501]' : ''}`} />
        </button>
      </div>
    </div>
  );
};
