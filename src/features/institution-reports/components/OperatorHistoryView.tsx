import React, { useState } from 'react';
import { ArrowPathIcon, CameraIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select.js';
import { AdjuntoMedia, IncidenteInstitucional } from '../types/institution-reports.types.js';
import { getEstadoBadgeConfig } from '../utils/incident-formatters.js';
import { useOperatorHistory } from '../hooks/useOperatorHistory.js';
import { InstitutionHeader } from './InstitutionHeader.js';
import { IncidentEvidenceModal } from './IncidentEvidenceModal.js';

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('es-BO', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz',
}).format(new Date(value)) : 'Fecha no disponible';

const HistoryDetail: React.FC<{ incident: IncidenteInstitucional; onViewMedia: (media: AdjuntoMedia) => void }> = ({ incident, onViewMedia }) => {
  const reports = incident.reportesVinculados?.length ? incident.reportesVinculados : [incident];
  return <aside className="max-h-[40vh] min-w-0 space-y-4 overflow-y-auto border-t border-stone-200 bg-white p-4 lg:max-h-none lg:w-[360px] lg:shrink-0 lg:border-l lg:border-t-0">
    <div><span className="font-mono text-xs font-bold text-stone-500">#{incident.codigoTicket}</span><h2 className="mt-1 text-lg font-bold text-stone-900">{incident.titulo}</h2><span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getEstadoBadgeConfig(incident.estado).badgeClass}`}>{getEstadoBadgeConfig(incident.estado).label}</span></div>
    <div className="space-y-2 border-y border-stone-200 py-3 text-xs text-stone-600"><p className="flex items-center gap-2"><ClockIcon className="h-4 w-4" />Cerrado el {formatDate(incident.fechaCierre)}</p><p className="flex items-start gap-2"><MapPinIcon className="h-4 w-4 shrink-0" />{incident.coordenadas.referencia}</p><p>Atendido por {incident.ultimaActualizacion.responsable}</p></div>
    <section><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Reportes vinculados ({reports.length})</h3><div className="space-y-2">{reports.map((report) => <div key={report.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3"><p className="text-xs font-semibold text-stone-900">{report.ciudadano.nombre}</p><p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-stone-600">{report.descripcion}</p>{report.adjuntos.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{report.adjuntos.map((media) => <button key={media.id} type="button" onClick={() => onViewMedia(media)} className="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"><CameraIcon className="h-4 w-4" />Ver evidencia</button>)}</div>}</div>)}</div></section>
  </aside>;
};

export const OperatorHistoryView: React.FC = () => {
  const { user } = useAuth();
  const isBomberos = user?.institucion === 'BOMBEROS' || user?.rol_id === 3;
  const { data, pagina, setPagina, orden, changeOrder, selectedId, setSelectedId, loading, error, reload } = useOperatorHistory();
  const [activeMedia, setActiveMedia] = useState<AdjuntoMedia | null>(null);
  const selected = data?.items.find((incident) => incident.id === selectedId) ?? null;
  const accent = isBomberos ? 'text-[#c42348]' : 'text-[#143601]';
  const selectedTone = isBomberos ? 'border-[#c42348] bg-rose-50' : 'border-[#143601] bg-emerald-50';
  return <div className={`flex h-screen w-screen flex-col overflow-hidden ${isBomberos ? 'bg-[#FBF1F0]' : 'bg-[#EEF4F0]'}`}>
    <InstitutionHeader />
    <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col p-3 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><h1 className={`text-xl font-bold ${accent}`}>Historial de incidentes</h1><p className="text-xs text-stone-600">Casos atendidos y falsas alarmas · {data?.total ?? 0} registros</p></div><div className="flex items-center gap-2"><span id="history-order-label" className="text-xs font-medium text-stone-600">Ordenar</span><Select value={orden} onValueChange={(value) => changeOrder(value as 'recientes' | 'antiguos')}><SelectTrigger aria-labelledby="history-order-label" className="w-36 border-stone-300 bg-white font-semibold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recientes">Más recientes</SelectItem><SelectItem value="antiguos">Más antiguos</SelectItem></SelectContent></Select><button type="button" onClick={reload} aria-label="Actualizar historial" title="Actualizar historial" className="rounded-lg border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-100"><ArrowPathIcon className="h-4 w-4" /></button></div></div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm lg:flex-row">
        <div className="flex min-h-[220px] min-w-0 flex-1 flex-col"><div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">{loading ? <p className="p-6 text-center text-sm text-stone-500">Cargando historial…</p> : error ? <p role="alert" className="p-6 text-center text-sm text-red-700">{error}</p> : data?.items.length ? <div className="space-y-2">{data.items.map((incident) => <button key={incident.id} type="button" onClick={() => setSelectedId(incident.id)} aria-current={selectedId === incident.id ? 'true' : undefined} className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-stone-50 ${selectedId === incident.id ? selectedTone : 'border-stone-200 bg-white'}`}><span className="min-w-0"><span className="font-mono text-[11px] font-semibold text-stone-500">#{incident.codigoTicket}</span><span className="block truncate text-sm font-bold text-stone-900">{incident.titulo}</span><span className="block truncate text-xs text-stone-600">{incident.coordenadas.referencia}</span></span><span className="flex flex-col items-end gap-1"><span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getEstadoBadgeConfig(incident.estado).badgeClass}`}>{getEstadoBadgeConfig(incident.estado).label}</span><span className="text-[11px] text-stone-500">{formatDate(incident.fechaCierre)}</span></span></button>)}</div> : <p className="p-6 text-center text-sm text-stone-500">No hay incidentes cerrados en el historial.</p>}</div>
          <div className="flex items-center justify-between border-t border-stone-200 px-3 py-2 text-xs text-stone-600"><span>{data?.total ? `${(pagina - 1) * 20 + 1}–${Math.min(pagina * 20, data.total)} de ${data.total}` : '0 incidentes'}</span><div className="flex items-center gap-2"><button type="button" disabled={pagina <= 1 || loading} onClick={() => setPagina(pagina - 1)} aria-label="Página anterior" className="rounded-md border border-stone-200 p-1.5 disabled:opacity-40"><ChevronLeftIcon className="h-4 w-4" /></button><span>Página {pagina} de {Math.max(1, data?.totalPaginas ?? 1)}</span><button type="button" disabled={pagina >= (data?.totalPaginas ?? 1) || loading} onClick={() => setPagina(pagina + 1)} aria-label="Página siguiente" className="rounded-md border border-stone-200 p-1.5 disabled:opacity-40"><ChevronRightIcon className="h-4 w-4" /></button></div></div>
        </div>
        {selected && <HistoryDetail incident={selected} onViewMedia={setActiveMedia} />}
      </div>
    </main>
    <IncidentEvidenceModal adjunto={activeMedia} onClose={() => setActiveMedia(null)} />
  </div>;
};
