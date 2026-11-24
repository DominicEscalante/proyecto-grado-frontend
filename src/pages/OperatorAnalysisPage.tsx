import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, FireIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.js';
import { useInstitutionReports } from '../features/institution-reports/hooks/useInstitutionReports.js';
import { useMapIncidentMarkers } from '../features/institution-reports/hooks/useMapIncidentMarkers.js';
import { buildHeatZones } from '../features/institution-reports/utils/heat-zones.js';
import { IncidenteInstitucional, InstitucionTipo } from '../features/institution-reports/types/institution-reports.types.js';
import { MapLegend } from '../features/institution-reports/components/MapLegend.js';

type PeriodoAnalisis = '24h' | '7d' | '30d' | '90d';

const PERIODOS: { id: PeriodoAnalisis; label: string; horas: number }[] = [
  { id: '24h', label: '24 horas', horas: 24 },
  { id: '7d', label: '7 días', horas: 24 * 7 },
  { id: '30d', label: '30 días', horas: 24 * 30 },
  { id: '90d', label: '90 días', horas: 24 * 90 },
];

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
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [institutionFilter, setInstitutionFilter] = useState<'TODAS' | InstitucionTipo>(institution ?? 'TODAS');
  const reports = useMemo(() => flattenReports(incidents), [incidents]);
  const filteredReports = useMemo(() => {
    const cutoff = Date.now() - PERIODOS.find((item) => item.id === period)!.horas * 60 * 60 * 1000;
    return reports.filter((report) =>
      new Date(report.fechaReporte).getTime() >= cutoff &&
      report.estado !== 'FALSA_ALARMA' &&
      (institutionFilter === 'TODAS' || report.institucion === institutionFilter)
    );
  }, [reports, period, institutionFilter]);
  const windowMs = PERIODOS.find((item) => item.id === period)!.horas * 3_600_000;
  const heatZones = useMemo(() => buildHeatZones(filteredReports, Date.now(), windowMs), [filteredReports, windowMs]);
  const statistics = useMemo(() => {
    const police = new Set<number>();
    const firefighters = new Set<number>();
    const hours = Array<number>(24).fill(0);
    const formatter = new Intl.DateTimeFormat('es-BO', {
      timeZone: 'America/La_Paz', hour: '2-digit', hourCycle: 'h23',
    });
    for (const report of filteredReports) {
      (report.institucion === 'POLICIA' ? police : firefighters).add(report.incidentePrincipalId ?? report.id);
      hours[Number(formatter.format(new Date(report.fechaReporte)))]++;
    }
    return { police: police.size, firefighters: firefighters.size, hours };
  }, [filteredReports]);
  const peak = Math.max(1, ...statistics.hours);
  const hotReportCount = heatZones.reduce((sum, zone) => sum + zone.cantidadReportes, 0);
  useMapIncidentMarkers({
    containerRef: { current: mapContainer },
    incidents: filteredReports,
    selectedIncident: null,
    onSelectIncident: () => undefined,
    mapStyle: 'light',
    isBomberos,
    compactMarkers: true,
    continuousHeatmap: true,
  });

  return <div className={`flex h-screen min-h-[560px] w-screen flex-col overflow-hidden font-sans text-stone-900 ${theme.bg}`}>
    <header className="z-20 flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link to="/operador/emergencias" aria-label="Volver al despacho" className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"><ArrowLeftIcon className="h-5 w-5" /></Link>
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Modo de análisis</p><h1 className="truncate text-lg font-bold text-stone-900 sm:text-xl">Mapa de zonas de calor</h1></div>
      </div>
      <div className="hidden items-center gap-2 sm:flex"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.soft} ${theme.accent}`}>{isBomberos ? 'Bomberos' : 'Policía'}</span><span className="text-xs text-stone-500">AMPAR · La Paz</span></div>
    </header>

    <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5 lg:p-6">
      <section className="flex shrink-0 flex-col justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div><h2 className="font-semibold text-stone-900">Concentración de reportes</h2><p className="mt-1 text-sm text-stone-500">Zonas agrupadas por cercanía. Se excluyen falsas alarmas.</p></div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtros del mapa">
          <div className="flex rounded-lg bg-stone-100 p-1">{PERIODOS.map((item) => <button key={item.id} type="button" aria-pressed={period === item.id} onClick={() => setPeriod(item.id)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${period === item.id ? `${theme.active} text-white shadow-sm` : 'text-stone-600 hover:text-stone-900'}`}>{item.label}</button>)}</div>
          <select aria-label="Filtrar institución" value={institutionFilter} onChange={(event) => setInstitutionFilter(event.target.value as 'TODAS' | InstitucionTipo)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-emerald-700/20">
            {!institution && <option value="TODAS">Todas las instituciones</option>}
            {institution !== 'BOMBEROS' && <option value="POLICIA">Policía</option>}
            {institution !== 'POLICIA' && <option value="BOMBEROS">Bomberos</option>}
          </select>
        </div>
      </section>

      <section className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-3">
        <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Reportes en período</p><p className="mt-2 text-2xl font-bold text-stone-900">{isLoading ? '—' : filteredReports.length}</p><p className="mt-1 text-xs text-stone-500">{PERIODOS.find((item) => item.id === period)?.label}</p></article>
        <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Zonas de concentración</p><p className={`mt-2 text-2xl font-bold ${theme.accent}`}>{isLoading ? '—' : heatZones.length}</p><p className="mt-1 text-xs text-stone-500">Al menos 3 reportes próximos</p></article>
        <article className="col-span-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm lg:col-span-1"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Reportes dentro de zonas</p><p className="mt-2 text-2xl font-bold text-red-700">{isLoading ? '—' : hotReportCount}</p><p className="mt-1 text-xs text-stone-500">{heatZones.filter((zone) => zone.intensidad === 'ALTA').length} zonas de intensidad alta</p></article>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-semibold">Incidentes por institución</h2>
        <dl className="mt-2 flex flex-wrap gap-4 text-sm">
          {institutionFilter !== 'BOMBEROS' && <div><dt>Policía</dt><dd className="font-bold">{isLoading ? '—' : statistics.police}</dd></div>}
          {institutionFilter !== 'POLICIA' && <div><dt>Bomberos</dt><dd className="font-bold">{isLoading ? '—' : statistics.firefighters}</dd></div>}
        </dl>
        <h3 className="mt-4 font-semibold">Reportes por hora de La Paz</h3>
        {!isLoading && <div className="overflow-x-auto"><ol className="mt-2 grid min-w-[570px] grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
          {statistics.hours.map((count, hour) => <li key={hour} className="text-center text-xs">
            <div className="flex h-24 flex-col justify-end">
              <span>{count}</span>
              <div aria-hidden="true" className={`rounded-t ${theme.active}`} style={{ height: `${count / peak * 75}%` }} />
            </div>
            <span>{String(hour).padStart(2, '0')}</span>
          </li>)}
        </ol></div>}
      </section>

      {error && <div role="status" className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">Sin conexión con la central. Reintentando automáticamente.</div>}
      <section className="relative min-h-[360px] flex-1 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm lg:min-h-[420px]" aria-label="Mapa de concentración de reportes">
        <div ref={setMapContainer} className="absolute inset-0 z-0 h-full w-full" />
        <div className="absolute left-4 top-4 z-[1000] flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-700 shadow"><MapPinIcon className="h-4 w-4" />{filteredReports.length} reportes</span>
          <span className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-700 shadow">{isBomberos ? <FireIcon className="h-4 w-4 text-rose-700" /> : <ShieldCheckIcon className="h-4 w-4 text-emerald-800" />}{institutionFilter === 'TODAS' ? 'Todas las instituciones' : institutionFilter === 'POLICIA' ? 'Policía' : 'Bomberos'}</span>
        </div>
        <MapLegend />
        {!isLoading && filteredReports.length === 0 && <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/35 p-6 text-center"><div className="rounded-xl border border-stone-200 bg-white/95 px-5 py-4 shadow"><p className="font-semibold text-stone-800">No hay reportes en este período</p><p className="mt-1 text-sm text-stone-500">Prueba otro rango de tiempo o institución.</p></div></div>}
      </section>
      <p className="shrink-0 text-xs text-stone-500">Las zonas se calculan con los reportes del período seleccionado, agrupados dentro de 300 m. Cada zona tiene al menos 3 reportes.</p>
    </main>
  </div>;
};
