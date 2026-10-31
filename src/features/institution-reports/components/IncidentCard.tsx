import React from 'react';
import { CloudArrowDownIcon, ExclamationTriangleIcon, FireIcon, LifebuoyIcon, ShieldExclamationIcon, TruckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { IncidenteInstitucional } from '../types/institution-reports.types.js';
import { formatTiempoRelativo, getEstadoBadgeConfig } from '../utils/incident-formatters.js';

interface Props { incident: IncidenteInstitucional; isSelected: boolean; selectedReportId: number | null; onSelect: (incident: IncidenteInstitucional) => void; onSelectReport: (incident: IncidenteInstitucional, report: IncidenteInstitucional) => void; isBomberos: boolean; }

export const IncidentCard: React.FC<Props> = ({ incident, isSelected, onSelect, isBomberos }) => {
  const kind = `${incident.tipoEmergencia} ${incident.titulo}`.toLowerCase();
  const Icon = isBomberos
    ? /incendio|fuego/.test(kind) ? FireIcon : /rescate|atrap/.test(kind) ? LifebuoyIcon : /inund|desborde/.test(kind) ? CloudArrowDownIcon : ExclamationTriangleIcon
    : /robo|asalto|hurto/.test(kind) ? ShieldExclamationIcon : /accidente|tránsito|transito|atropello|colisión|colision/.test(kind) ? TruckIcon : /violencia|riña|rina|orden público|orden publico/.test(kind) ? UserGroupIcon : ExclamationTriangleIcon;
  const status = getEstadoBadgeConfig(incident.estado);
  const count = incident.reportesVinculados?.length ?? incident.cantidadReportes ?? 1;
  return <button type="button" onClick={() => onSelect(incident)} aria-current={isSelected ? 'true' : undefined} className={`relative mb-2 flex w-full cursor-pointer gap-3 rounded-xl border p-3 text-left transition-all hover:shadow-sm ${isSelected ? isBomberos ? 'border-2 border-[#c42348] bg-[#fff4f4] shadow-sm' : 'border-2 border-emerald-800 bg-emerald-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
    {isSelected && <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${isBomberos ? 'bg-[#c42348]' : 'bg-emerald-800'}`} />}
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isBomberos ? 'bg-rose-50 text-[#c42348]' : 'bg-emerald-50 text-emerald-800'}`}><Icon className="h-5 w-5" /></span>
    <span className="min-w-0 flex-1">
      <span className="flex items-start justify-between gap-2"><span className="truncate text-sm font-bold text-stone-900">{incident.titulo}</span><span className="shrink-0 text-[10px] text-stone-500">{formatTiempoRelativo(incident.fechaReporte).replace('Reportado ', '')}</span></span>
      <span className="mt-1 block truncate text-xs text-stone-600">{incident.coordenadas.referencia}</span>
      <span className="mt-2 flex flex-wrap items-center gap-1.5"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.badgeClass}`}>{status.label}</span><span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">{count} {count === 1 ? 'llamada' : 'llamadas'}</span></span>
    </span>
  </button>;
};
