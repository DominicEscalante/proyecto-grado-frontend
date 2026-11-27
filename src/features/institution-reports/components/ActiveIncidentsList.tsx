import React, { useMemo, useRef, useState } from 'react';
import { CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { DateRange } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { Calendar } from '../../../components/ui/calendar.js';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select.js';
import { IncidenteInstitucional } from '../types/institution-reports.types.js';
import { filterDispatchIncidents } from '../utils/dispatch-filters.js';
import { IncidentCard } from './IncidentCard.js';

interface Props {
  incidents: IncidenteInstitucional[]; selectedIncidentId: number | null;
  onSelectIncident: (incident: IncidenteInstitucional) => void;
  selectedReportId: number | null;
  onSelectReport: (incident: IncidenteInstitucional, report: IncidenteInstitucional) => void;
  busqueda: string; onBusquedaChange: (value: string) => void; isLoading: boolean;
  isBomberos: boolean;
}

const dateKey = new Intl.DateTimeFormat('sv-SE');
const dateLabel = new Intl.DateTimeFormat('es-BO', { dateStyle: 'short' });

export const ActiveIncidentsList: React.FC<Props> = ({ incidents, selectedIncidentId, selectedReportId, onSelectIncident, onSelectReport, busqueda, onBusquedaChange, isLoading, isBomberos }) => {
  const [range, setRange] = useState<DateRange>();
  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const desde = range?.from ? dateKey.format(range.from) : '';
  const hasta = range?.to ? dateKey.format(range.to) : '';
  const [tipo, setTipo] = useState('');
  const tipos = useMemo(() => [...new Set(incidents.map((incident) => incident.tipoEmergencia))]
    .sort((a, b) => a.localeCompare(b, 'es')), [incidents]);
  const [filter, setFilter] = useState<'PENDIENTES' | 'EN_CURSO' | 'FALSA_ALARMA'>('PENDIENTES');
  const visible = useMemo(
    () => filterDispatchIncidents(incidents, filter, tipo, desde, hasta),
    [incidents, filter, tipo, desde, hasta],
  );
  const sectionTitle = filter === 'FALSA_ALARMA' ? 'Falsas Alarmas' : 'Incidentes Activos';

  return (
    <aside className={`flex h-full w-full shrink-0 flex-col overflow-hidden border-r md:w-80 lg:w-96 ${isBomberos ? 'border-[#ec5766]/20 bg-[#FBF1F0]' : 'border-emerald-900/15 bg-[#EEF4F0]'}`}>
      <div className={`border-b p-4 ${isBomberos ? 'border-[#ec5766]/20' : 'border-emerald-900/10'}`}>
        <div className="mb-3 flex items-center gap-2"><h2 className={`text-sm font-bold ${isBomberos ? 'text-[#c42348]' : 'text-emerald-950'}`}>{sectionTitle}</h2><span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${isBomberos ? 'border-[#ec5766]/20 bg-[#FDF8F7] text-[#c42348]' : 'border-emerald-900/10 bg-[#F8FAF8] text-emerald-950'}`}>{visible.length}</span></div>
        <label className="relative block">
          <MagnifyingGlassIcon className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isBomberos ? 'text-[#da344d]/70' : 'text-stone-400'}`} />
          <input value={busqueda} onChange={(event) => onBusquedaChange(event.target.value)} placeholder="Buscar incidente, dirección o ticket" className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs text-stone-800 outline-none placeholder:text-stone-400 ${isBomberos ? 'border-[#ec5766]/20 bg-[#FDF8F7] focus:border-[#da344d] focus:ring-[#da344d]/10' : 'border-emerald-900/10 bg-[#F8FAF8] focus:border-emerald-700 focus:ring-emerald-700/10'} focus:ring-2`} />
        </label>
        <div className="mt-3 grid gap-2 text-xs">
          <div className="grid gap-1">
            <span id="dispatch-date-label">Rango de fechas</span>
            <div className="relative">
              <Popover>
                <PopoverTrigger ref={dateTriggerRef} aria-labelledby="dispatch-date-label dispatch-date-value" className="flex h-8.5 w-full items-center gap-2 rounded-lg border border-stone-200 bg-white pl-3 pr-9 text-left font-medium text-stone-800 focus-visible:outline-2 focus-visible:outline-current">
                  <CalendarDaysIcon className="h-4 w-4 text-stone-500" />
                  <span id="dispatch-date-value">
                    {range?.from ? `${dateLabel.format(range.from)} – ${range.to ? dateLabel.format(range.to) : 'Sin fecha final'}` : 'Todas las fechas'}
                  </span>
                </PopoverTrigger>
                <PopoverContent aria-label="Seleccionar rango de fechas">
                  <Calendar mode="range" locale={es} selected={range} onSelect={setRange} defaultMonth={range?.from} autoFocus accentColor={isBomberos ? '#c42348' : '#245501'} />
                  {range && <button type="button" onClick={() => setRange(undefined)} className="mt-2 rounded border border-stone-200 px-2 py-1 text-xs font-medium hover:bg-stone-100">Limpiar fechas</button>}
                </PopoverContent>
              </Popover>
              {range?.from && (
                <button
                  type="button"
                  aria-label="Limpiar rango de fechas"
                  title="Limpiar rango de fechas"
                  onClick={() => {
                    setRange(undefined);
                    dateTriggerRef.current?.focus();
                  }}
                  className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-current"
                >
                  <XMarkIcon aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-1">
            <label htmlFor="dispatch-emergency-type">Tipo de emergencia</label>
            <Select value={tipo || '__all__'} onValueChange={(value) => setTipo(value === '__all__' ? '' : value)}>
              <SelectTrigger id="dispatch-emergency-type" className="bg-white"><SelectValue placeholder="Todos los tipos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los tipos</SelectItem>
                {tipos.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div role="group" aria-label="Filtrar por estado" className={`mt-3 grid grid-cols-3 rounded-lg p-1 ${isBomberos ? 'bg-[#ec5766]/10' : 'bg-emerald-900/5'}`}>
          {([['PENDIENTES', 'Pendientes'], ['EN_CURSO', 'En revisión'], ['FALSA_ALARMA', 'Falsas']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-md px-1 py-1.5 text-[10px] font-semibold transition-colors ${filter === value ? `${isBomberos ? 'bg-[#c42348]' : 'bg-[#143601]'} text-white shadow-sm` : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>{label}</button>)}
        </div>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-2">
        {isLoading ? <div className="p-8 text-center text-sm text-stone-500">Sincronizando incidentes…</div> : visible.length ? visible.map((incident) => <IncidentCard key={incident.id} incident={incident} isSelected={selectedIncidentId === incident.id} selectedReportId={selectedReportId} onSelect={onSelectIncident} onSelectReport={onSelectReport} isBomberos={isBomberos} />) : <div className="p-8 text-center text-sm text-stone-500">No hay incidentes para este filtro.</div>}
      </div>
      <div className={`flex items-center justify-between border-t px-4 py-2 text-[11px] ${isBomberos ? 'border-[#ec5766]/20 text-[#c42348]/75' : 'border-emerald-900/10 text-emerald-950/65'}`}><span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${isBomberos ? 'bg-[#ec5766]' : 'bg-emerald-600'}`} />En escucha activa</span><span>{visible.length} visibles</span></div>
    </aside>
  );
};
