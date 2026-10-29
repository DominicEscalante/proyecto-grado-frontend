import React, { useMemo, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { IncidenteInstitucional } from '../types/institution-reports.types.js';
import { IncidentCard } from './IncidentCard.js';

interface Props {
  incidents: IncidenteInstitucional[]; selectedIncidentId: number | null;
  onSelectIncident: (incident: IncidenteInstitucional) => void;
  busqueda: string; onBusquedaChange: (value: string) => void; isLoading: boolean;
  isBomberos: boolean;
}

export const ActiveIncidentsList: React.FC<Props> = ({ incidents, selectedIncidentId, onSelectIncident, busqueda, onBusquedaChange, isLoading, isBomberos }) => {
  const [filter, setFilter] = useState<'PENDIENTES' | 'EN_CURSO' | 'FALSA_ALARMA' | 'ATENDIDOS'>('PENDIENTES');
  const visible = useMemo(() => incidents.filter((incident) => {
    if (filter === 'PENDIENTES') return incident.estado === 'PENDIENTE';
    if (filter === 'EN_CURSO') return incident.estado === 'DESPACHADO' || incident.estado === 'EN_CURSO';
    if (filter === 'FALSA_ALARMA') return incident.estado === 'FALSA_ALARMA';
    return incident.estado === 'ATENDIDO';
  }), [incidents, filter]);
  const sectionTitle = filter === 'ATENDIDOS' ? 'Historial de Reportes' : filter === 'FALSA_ALARMA' ? 'Falsas Alarmas' : 'Incidentes Activos';

  return (
    <aside className={`flex h-full w-full shrink-0 flex-col overflow-hidden border-r md:w-80 lg:w-96 ${isBomberos ? 'border-[#ec5766]/20 bg-[#FBF1F0]' : 'border-emerald-900/15 bg-[#EEF4F0]'}`}>
      <div className={`border-b p-4 ${isBomberos ? 'border-[#ec5766]/20' : 'border-emerald-900/10'}`}>
        <div className="mb-3 flex items-center gap-2"><h2 className={`text-sm font-bold ${isBomberos ? 'text-[#c42348]' : 'text-emerald-950'}`}>{sectionTitle}</h2><span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${isBomberos ? 'border-[#ec5766]/20 bg-[#FDF8F7] text-[#c42348]' : 'border-emerald-900/10 bg-[#F8FAF8] text-emerald-950'}`}>{visible.length}</span></div>
        <label className="relative block">
          <MagnifyingGlassIcon className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isBomberos ? 'text-[#da344d]/70' : 'text-stone-400'}`} />
          <input value={busqueda} onChange={(event) => onBusquedaChange(event.target.value)} placeholder="Buscar incidente, dirección o ticket" className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-stone-800 outline-none placeholder:text-stone-400 ${isBomberos ? 'border-[#ec5766]/20 bg-[#FDF8F7] focus:border-[#da344d] focus:ring-[#da344d]/10' : 'border-emerald-900/10 bg-[#F8FAF8] focus:border-emerald-700 focus:ring-emerald-700/10'} focus:ring-2`} />
        </label>
        <div role="group" aria-label="Filtrar por estado" className={`mt-3 grid grid-cols-4 rounded-lg p-1 ${isBomberos ? 'bg-[#ec5766]/10' : 'bg-emerald-900/5'}`}>
          {([['PENDIENTES', 'Pendientes'], ['EN_CURSO', 'En curso'], ['ATENDIDOS', 'Atendidos'], ['FALSA_ALARMA', 'Falsas']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-md px-1 py-1.5 text-[10px] font-semibold transition-colors ${filter === value ? `${isBomberos ? 'bg-[#c42348]' : 'bg-[#143601]'} text-white shadow-sm` : isBomberos ? 'text-[#c42348]/75 hover:text-[#c42348]' : 'text-emerald-950/65 hover:text-emerald-950'}`}>{label}</button>)}
        </div>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {isLoading ? <div className="p-8 text-center text-sm text-stone-500">Sincronizando incidentes…</div> : visible.length ? visible.map((incident) => <IncidentCard key={incident.id} incident={incident} isSelected={selectedIncidentId === incident.id} onSelect={onSelectIncident} isBomberos={isBomberos} />) : <div className="p-8 text-center text-sm text-stone-500">No hay incidentes para este filtro.</div>}
      </div>
      <div className={`flex items-center justify-between border-t px-4 py-2 text-[11px] ${isBomberos ? 'border-[#ec5766]/20 text-[#c42348]/75' : 'border-emerald-900/10 text-emerald-950/65'}`}><span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${isBomberos ? 'bg-[#ec5766]' : 'bg-emerald-600'}`} />En escucha activa</span><span>{visible.length} visibles</span></div>
    </aside>
  );
};
