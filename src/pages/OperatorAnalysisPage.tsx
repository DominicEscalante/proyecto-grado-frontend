import { Clock3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InstitutionHeader } from '../features/institution-reports/components/InstitutionHeader.js';
import { useAuth } from '../context/AuthContext.js';
import { useInstitutionReports } from '../features/institution-reports/hooks/useInstitutionReports.js';
import L from 'leaflet';
import { buildHeatZones } from '../features/institution-reports/utils/heat-zones.js';
import { IncidenteInstitucional, InstitucionTipo } from '../features/institution-reports/types/institution-reports.types.js';

type PeriodoAnalisis = '24h' | '7d' | '30d' | '90d';

const PERIODOS: { id: PeriodoAnalisis; label: string; horas: number }[] = [
  { id: '24h', label: '24 horas', horas: 24 },
  { id: '7d', label: '7 días', horas: 24 * 7 },
  { id: '30d', label: '30 días', horas: 24 * 30 },
  { id: '90d', label: '90 días', horas: 24 * 90 },
];

const localHour = new Intl.DateTimeFormat('es-BO', {
  timeZone: 'America/La_Paz', hour: '2-digit', hourCycle: 'h23',
});
const hourLabel = (hour: number) => String(hour).padStart(2, '0') + ':00';

function includesHour(range: readonly [number, number] | null, hour: number) {
  if (!range) return true;
  const [start, end] = range;
  return start <= end ? hour >= start && hour <= end : hour >= start || hour <= end;
}

function flattenReports(incidents: IncidenteInstitucional[]): IncidenteInstitucional[] {
  return incidents.flatMap((incident) =>
    incident.reportesVinculados?.length ? incident.reportesVinculados : [incident]
  );
}

export const OperatorAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const institution = user?.institucion ?? (user?.rol_id === 3 ? 'BOMBEROS' : user?.rol_id === 2 ? 'POLICIA' : undefined);
  const isBomberos = institution === 'BOMBEROS';
  const theme = isBomberos
    ? { bg: 'bg-[#FBF1F0]', accent: 'text-[#b4233c]', active: 'bg-[#c42348]', soft: 'bg-rose-50', border: 'border-rose-200' }
    : { bg: 'bg-[#EEF4F0]', accent: 'text-[#143601]', active: 'bg-[#143601]', soft: 'bg-emerald-50', border: 'border-emerald-200' };
  const { incidents, isLoading, error } = useInstitutionReports(institution);
  const [period, setPeriod] = useState<PeriodoAnalisis>('24h');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [institutionFilter, setInstitutionFilter] = useState<'TODAS' | InstitucionTipo>(institution ?? 'TODAS');
  const reports = useMemo(() => flattenReports(incidents), [incidents]);
  const [category, setCategory] = useState('');
  const [hourFilter, setHourFilter] = useState<[number, number] | null>(null);
  const periodReports = useMemo(() => {
    const cutoff = Date.now() - PERIODOS.find((item) => item.id === period)!.horas * 60 * 60 * 1000;
    return reports.filter((report) =>
      new Date(report.fechaReporte).getTime() >= cutoff &&
      report.estado !== 'FALSA_ALARMA' &&
      (institutionFilter === 'TODAS' || report.institucion === institutionFilter)
    );
  }, [reports, period, institutionFilter]);
  const categories = useMemo(() => [...new Set(periodReports.map(r => r.tipoEmergencia))].sort(), [periodReports]);
  const analysis = useMemo(() => {
    const hours = Array<number>(24).fill(0);
    const types = new Map<string, number>();
    const matches: IncidenteInstitucional[] = [];
    for (const report of periodReports) {
      const hour = Number(localHour.format(new Date(report.fechaReporte)));
      const typeMatches = !category || category === report.tipoEmergencia;
      const hourMatches = includesHour(hourFilter, hour);
      if (typeMatches) hours[hour]++;
      if (hourMatches) types.set(report.tipoEmergencia, (types.get(report.tipoEmergencia) ?? 0) + 1);
      if (typeMatches && hourMatches) matches.push(report);
    }
    return { matches, hours, types: [...types].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) };
  }, [periodReports, category, hourFilter]);
  const filteredReports = analysis.matches;
  const windowMs = PERIODOS.find((item) => item.id === period)!.horas * 3_600_000;
  const heatZones = useMemo(() => buildHeatZones(filteredReports, Date.now(), windowMs), [filteredReports, windowMs]);
  const statistics = useMemo(() => {
    const police = new Set<number>();
    const firefighters = new Set<number>();
    for (const report of filteredReports) {
      (report.institucion === 'POLICIA' ? police : firefighters).add(report.incidentePrincipalId ?? report.id);
    }
    return { police: police.size, firefighters: firefighters.size };
  }, [filteredReports]);
  const peak = Math.max(1, ...analysis.hours);
  const peakHours = analysis.hours.flatMap((count, hour) =>
    count === peak ? [`${String(hour).padStart(2, '0')}:00`] : []
  );

  useEffect(() => {
    const container = mapContainer.current;
    if (!container) return;
    const instance = L.map(container, { scrollWheelZoom: false }).setView([-16.5, -68.15], 13);
    map.current = instance;
    const cartoKey = import.meta.env.VITE_CARTO_API_KEY?.trim();
    const tileUrl = cartoKey
      ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoKey)}`
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(instance);
    let pinchDelta = 0;
    const handlePinch = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      pinchDelta += L.DomEvent.getWheelDelta(event);
      if (Math.abs(pinchDelta) < 40) return;
      instance.setZoomAround(instance.mouseEventToContainerPoint(event), instance.getZoom() + Math.sign(pinchDelta));
      pinchDelta = 0;
    };

    const handleZoomShortcut = (event: KeyboardEvent) => {
      if ((!event.ctrlKey && !event.metaKey) || event.altKey) return;
      const zoomIn = event.key === '+' || event.key === '=';
      if (!zoomIn && event.key !== '-') return;
      event.preventDefault();
      event.stopPropagation();
      if (zoomIn) instance.zoomIn();
      else instance.zoomOut();
    };

    container.addEventListener('wheel', handlePinch, { passive: false });
    container.addEventListener('keydown', handleZoomShortcut);
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container);
    return () => {
      container.removeEventListener('wheel', handlePinch);
      container.removeEventListener('keydown', handleZoomShortcut);
      observer.disconnect();
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const layer = L.layerGroup().addTo(instance);
    const bounds = L.latLngBounds([]);
    heatZones.forEach((zone, index) => {
      const color = zone.intensidad === 'ALTA' ? '#a3341d' : '#bd831e';
      const circle = L.circle([zone.latitud, zone.longitud], {
        radius: zone.radioMetros, color, weight: 2, fillColor: color, fillOpacity: 0.4,
      }).bindTooltip(String(index + 1), { permanent: true, direction: 'center' }).addTo(layer);
      bounds.extend(circle.getBounds());
    });
    if (bounds.isValid()) instance.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    return () => { layer.remove(); };
  }, [heatZones]);

  return <div className={`flex h-dvh w-full flex-col overflow-hidden font-sans text-stone-900 ${theme.bg}`}>
    <InstitutionHeader />
    <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5 lg:p-6">
      <section className="flex shrink-0 flex-col justify-between gap-3 border-b border-black/10 pb-4 sm:flex-row sm:items-center">
        <div><h1 className={`text-2xl font-semibold tracking-tight ${theme.accent}`}>Análisis de incidentes</h1><p className="mt-1 text-sm text-stone-500">Zonas agrupadas por cercanía. Se excluyen falsas alarmas.</p></div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtros del mapa">
          <div className="flex rounded-lg bg-stone-100 p-1">{PERIODOS.map((item) => <button key={item.id} type="button" aria-pressed={period === item.id} onClick={() => { setPeriod(item.id); setCategory(''); setHourFilter(null); }} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${period === item.id ? `${theme.active} text-white shadow-sm` : 'text-stone-600 hover:text-stone-900'}`}>{item.label}</button>)}</div>
          <Select value={institutionFilter} onValueChange={value => setInstitutionFilter(value as 'TODAS' | InstitucionTipo)}>
            <SelectTrigger aria-label="Filtrar institución" className="w-48 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {!institution && <SelectItem value="TODAS">Todas las instituciones</SelectItem>}
              {institution !== 'BOMBEROS' && <SelectItem value="POLICIA">Policía</SelectItem>}
              {institution !== 'POLICIA' && <SelectItem value="BOMBEROS">Bomberos</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="flex shrink-0 flex-wrap items-end gap-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm">
        <div className="grid gap-1">
          <label htmlFor="analysis-category" className="text-xs font-semibold text-stone-600">Tipo de emergencia</label>
          <Select value={category ? `type:${category}` : 'all'} onValueChange={value => setCategory(value === 'all' ? '' : value.slice(5))}>
            <SelectTrigger id="analysis-category" className="w-56 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {categories.filter(Boolean).map(type => <SelectItem key={type} value={`type:${type}`}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(['Desde', 'Hasta'] as const).map((label, endpoint) => (
        <div key={label} className="grid gap-1">
          <label htmlFor={`analysis-hour-${endpoint}`} className="text-xs font-semibold text-stone-600">{label} · Hora de La Paz</label>
          <DropdownMenu>
            <DropdownMenuTrigger id={`analysis-hour-${endpoint}`} className="flex h-9 min-w-44 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm hover:bg-stone-50">
              <Clock3 size={16} aria-hidden="true" />
              {hourFilter === null ? 'Todas las horas' : endpoint === 0 ? hourLabel(hourFilter[0]) : `${String(hourFilter[1]).padStart(2, '0')}:59`}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="p-3">
              <DropdownMenuRadioGroup aria-label="Hora de La Paz" value={hourFilter === null ? 'all' : String(hourFilter[endpoint])}
                onValueChange={value => {
                  if (value === 'all') { setHourFilter(null); return; }
                  const hour = Number(value);
                  setHourFilter(previous => endpoint === 0 ? [hour, previous?.[1] ?? hour] : [previous?.[0] ?? hour, hour]);
                }}>
                <DropdownMenuRadioItem value="all">Todas las horas</DropdownMenuRadioItem>
                <div className="relative mt-2 h-60 w-60 rounded-full border border-stone-200 bg-stone-50">
                  {analysis.hours.map((_, hour) => {
                    const angle = (hour % 12) * Math.PI / 6;
                    const radius = hour < 12 ? 41 : 28;
                    return (
                      <DropdownMenuRadioItem key={hour} value={String(hour)} aria-label={hourLabel(hour)}
                        style={{ left: `${50 + Math.sin(angle) * radius}%`, top: `${50 - Math.cos(angle) * radius}%` }}
                        className={`absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full p-0 tabular-nums [&>span]:hidden data-[highlighted]:ring-2 data-[highlighted]:ring-stone-400 ${hourFilter?.[endpoint] === hour ? `${theme.active} text-white` : ''}`}>
                        {String(hour).padStart(2, '0')}
                      </DropdownMenuRadioItem>
                    );
                  })}
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 m-auto size-5 text-stone-400"><Clock3 size={20} /></span>
                </div>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        ))}
        {(category || hourFilter !== null) && <button onClick={() => { setCategory(''); setHourFilter(null); }} className="rounded px-3 py-2 text-xs font-semibold underline">Limpiar filtros</button>}
      </div>

      <section className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-3">
        <article className={`rounded-lg border bg-white p-4 ${theme.border}`}><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Reportes seleccionados</p><p className="mt-2 text-2xl font-bold text-stone-900">{isLoading ? '—' : filteredReports.length}</p><p className="mt-1 text-xs text-stone-500">{institutionFilter !== 'BOMBEROS' && `Policía: ${statistics.police} incidentes`}{institutionFilter === 'TODAS' && ' · '}{institutionFilter !== 'POLICIA' && `Bomberos: ${statistics.firefighters} incidentes`}</p></article>
        <article className={`rounded-lg border bg-white p-4 ${theme.border}`}><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Zonas de concentración</p><p className={`mt-2 text-2xl font-bold ${theme.accent}`}>{isLoading ? '—' : heatZones.length}</p><p className="mt-1 text-xs text-stone-500">Al menos 3 reportes próximos</p></article>
        <article className={`col-span-2 rounded-lg border bg-white p-4 lg:col-span-1 ${theme.border}`}><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Horas pico · La Paz</p><p className={`mt-2 font-bold tabular-nums ${theme.accent}`}>{isLoading || !peakHours.length ? '—' : peakHours.join(' · ')}</p><p className="mt-1 text-xs text-stone-500">{peakHours.length > 0 ? `${peak} reportes en cada hora pico durante el período` : 'Sin registros en el período'}</p></article>
      </section>

      {error && <div role="status" className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">Sin conexión con la central. Reintentando automáticamente.</div>}
      <section className="grid shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-white lg:grid-cols-[2fr_1fr]" aria-label="Concentración territorial">
        <div className="relative isolate min-h-[330px] lg:min-h-[420px]">
          <div ref={mapContainer} tabIndex={0} className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2" aria-label="Mapa de zonas numeradas según cantidad de reportes" />
          <div className="pointer-events-none absolute bottom-6 left-3 z-[500] rounded bg-white/95 px-3 py-2 text-xs shadow">
            <span className="text-amber-800">● 3–4 reportes</span> · <span className="text-red-800">● 5 o más</span>
          </div>
        </div>
        <aside className="border-t border-stone-200 p-5 lg:border-l lg:border-t-0">
          <h2 className="font-semibold">Zonas con más reportes</h2>
          <p className="mt-1 text-xs text-stone-500">Selecciona una zona para ubicarla en el mapa.</p>
          <ol className="mt-3 max-h-80 divide-y overflow-y-auto">
            {heatZones.map((zone, index) => (
              <li key={`${zone.latitud},${zone.longitud}`}>
                <button className="flex w-full gap-3 rounded py-3 text-left hover:bg-stone-50" onClick={() => map.current?.setView([zone.latitud, zone.longitud], 15)}>
                  <span className={`font-mono font-bold ${theme.accent}`}>{index + 1}</span>
                  <span><strong className="block text-sm">{zone.referencia}</strong>
                    <span className="block text-xs text-stone-600">{zone.cantidadReportes} reportes · {zone.incidentes} incidentes</span>
                    <span className="block text-xs text-stone-600">Más reportado: {zone.tiposPrincipales.join(', ')}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {!heatZones.length && <p className="py-4 text-sm text-stone-600">{isLoading ? 'Cargando zonas…' : error ? 'Datos de zonas no disponibles.' : 'Sin concentraciones de tres o más reportes para este período.'}</p>}
        </aside>
      </section>
      <p className="shrink-0 text-xs text-stone-500">Las zonas se calculan con los reportes del período seleccionado, agrupados dentro de 300 m. Cada zona tiene al menos 3 reportes.</p>
      <section className="grid shrink-0 gap-4 lg:grid-cols-[3fr_2fr]">
        <article className="min-w-0 rounded-md border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">Distribución por hora</h2>
          <p className="mt-1 text-xs text-stone-500">Hora de La Paz · Selecciona una barra para filtrar el mapa.</p>
          <div className="mt-5 overflow-x-auto">
            <div className="grid min-w-[510px] grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
              {analysis.hours.map((count, hour) => (
                <button key={hour} type="button" aria-pressed={hourFilter !== null && includesHour(hourFilter, hour)}
                  aria-label={`${hourLabel(hour)}, ${count} reportes`} title={`${hourLabel(hour)} · ${count} reportes`}
                  onClick={() => setHourFilter(hourFilter?.[0] === hour && hourFilter[1] === hour ? null : [hour, hour])}
                  className={`group flex flex-col rounded text-center text-[10px] tabular-nums hover:bg-stone-100 ${hourFilter !== null && includesHour(hourFilter, hour) ? theme.soft : ''}`}>
                  <span className="flex h-28 w-full flex-col items-center justify-end border-b border-stone-300">
                    <span>{count || ''}</span>
                    <span className={`w-3/4 rounded-t ${theme.active} ${!includesHour(hourFilter, hour) ? 'opacity-40' : ''}`} style={{ height: `${count / peak * 78}%` }} />
                  </span>
                  <span className="w-full py-1">{String(hour).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          </div>
        </article>
        <article className="min-w-0 rounded-md border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">Reportes por tipo de emergencia</h2>
          <p className="mt-1 text-xs text-stone-500">{hourFilter === null ? 'Todas las horas' : `${hourLabel(hourFilter[0])}–${String(hourFilter[1]).padStart(2, '0')}:59`} · Selecciona un tipo para explorar sus zonas.</p>
          <div className="mt-4 max-h-48 space-y-1 overflow-auto">
            {analysis.types.map(([type, count]) => (
              <button key={type} aria-pressed={category === type} onClick={() => setCategory(type === category ? '' : type)}
                className={`block w-full rounded px-2 py-1.5 text-left hover:bg-stone-100 ${category === type ? theme.soft : ''}`}>
                <span className="flex justify-between gap-2 text-xs"><span>{type}</span><strong>{count}</strong></span>
                <span className="mt-1 block h-1.5 rounded bg-stone-100"><span className={`block h-full rounded ${theme.active}`} style={{ width: `${100 * count / analysis.types[0][1]}%` }} /></span>
              </button>
            ))}
            {!analysis.types.length && <p className="text-xs text-stone-500">{isLoading ? 'Cargando…' : 'Sin reportes para esta selección.'}</p>}
          </div>
        </article>
      </section>
    </main>
  </div>;
};
