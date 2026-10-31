import React, { useState } from 'react';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, CameraIcon, CheckCircleIcon, ChevronDownIcon, ClipboardDocumentIcon, ClockIcon, ExclamationCircleIcon, MapPinIcon, PhoneIcon, TruckIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { IncidenteInstitucional, EstadoIncidente, AdjuntoMedia } from '../types/institution-reports.types.js';
import { formatTiempoRelativo, getEstadoBadgeConfig } from '../utils/incident-formatters.js';
import { IncidentEvidenceModal } from './IncidentEvidenceModal.js';
import { useReportAddress } from '../hooks/useReportAddress.js';

interface Props { incident: IncidenteInstitucional | null; selectedReport: IncidenteInstitucional | null; onUpdateStatus: (id: number, estado: EstadoIncidente) => void; isBomberos: boolean; }

export const IncidentDetailInspector: React.FC<Props> = ({ incident, selectedReport, onUpdateStatus, isBomberos }) => {
  const [activeMedia, setActiveMedia] = useState<AdjuntoMedia | null>(null);
  const [openReportId, setOpenReportId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const direccion = useReportAddress(incident?.codigoTicket, incident?.coordenadas.referencia);
  const panelTone = isBomberos ? 'border-[#ec5766]/20 bg-[#FBF1F0]' : 'border-emerald-900/15 bg-[#EEF4F0]';
  if (!incident) return <aside className={`flex h-full w-full shrink-0 items-center justify-center border-l p-6 text-center text-sm text-stone-500 md:w-96 lg:w-[420px] ${panelTone}`}>Selecciona un incidente para ver su ficha operativa.</aside>;
  const reports = incident.reportesVinculados?.length ? incident.reportesVinculados : [incident];
  const evidence = reports.flatMap((report) => report.adjuntos.map((media) => ({ media, reportId: report.id, sender: report.ciudadano.nombre })));
  const description = reports.map((report) => report.descripcion).join(' ').toLowerCase();
  const alerts = (isBomberos ? [
    /fuego|llama|incendio/.test(description) && { label: 'Fuego activo', Icon: ExclamationCircleIcon },
    /atrapad|encerrad|personas dentro/.test(description) && { label: 'Personas atrapadas', Icon: UserGroupIcon },
    /vía bloqueada|via bloqueada|calle bloqueada|acceso bloqueado/.test(description) && { label: 'Vía bloqueada', Icon: ExclamationCircleIcon },
  ] : [
    /arma|armad/.test(description) && { label: 'Posible arma', Icon: ExclamationCircleIcon },
    /herid|lesionad|atropellad/.test(description) && { label: 'Personas heridas', Icon: UserGroupIcon },
    /robo|asalto|forzando|hurto/.test(description) && { label: 'Delito en curso', Icon: ExclamationCircleIcon },
    /riña|rina|agresi|violencia/.test(description) && { label: 'Violencia activa', Icon: UserGroupIcon },
    /tráfico paralizado|trafico paralizado|vía bloqueada|via bloqueada/.test(description) && { label: 'Vía bloqueada', Icon: ExclamationCircleIcon },
  ]).filter((alert): alert is { label: string; Icon: typeof ExclamationCircleIcon } => Boolean(alert));
  const status = getEstadoBadgeConfig(incident.estado);
  const pending = incident.estado === 'PENDIENTE';
  const completed = incident.estado === 'ATENDIDO';
  const falseAlarm = incident.estado === 'FALSA_ALARMA';
  const coordinates = `${incident.coordenadas.latitud.toFixed(6)}, ${incident.coordenadas.longitud.toFixed(6)}`;
  return <>
    <aside className={`flex h-full w-full shrink-0 flex-col overflow-hidden border-l md:w-96 lg:w-[420px] ${panelTone}`}>
      <div className={`border-b p-4 ${isBomberos ? 'border-[#ec5766]/20' : 'border-emerald-900/15'}`}>
        <div className="mb-1 flex items-center justify-between gap-2"><span className="font-mono text-sm font-bold text-stone-900">#{incident.codigoTicket}</span><span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.badgeClass}`}>{status.label}</span></div>
        <h2 className="text-lg font-bold leading-tight text-stone-900">{incident.titulo}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-600"><ClockIcon className="h-4 w-4" />{formatTiempoRelativo(incident.fechaReporte)} ({incident.horaFormateada})</p>
        {incident.estado !== 'PENDIENTE' && <p className="mt-1 text-[11px] text-stone-500">Actualizado {incident.ultimaActualizacion.hora} por {incident.ultimaActualizacion.responsable}</p>}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <section className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">Situación reportada</h3><div className="flex flex-wrap gap-1.5">{alerts.length ? alerts.map(({ label, Icon }) => <span key={label} className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-800"><Icon className="h-3.5 w-3.5" />{label}</span>) : <span className="text-xs text-stone-600">{incident.descripcion}</span>}</div></section>
        <section className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-stone-800"><MapPinIcon className="h-4 w-4" />Ubicación operativa</h3><p className="mb-2 text-sm font-semibold text-stone-900">{direccion}</p><div className="flex items-center justify-between gap-2 rounded-lg bg-stone-100 p-2 font-mono text-xs text-stone-600"><span>{coordinates}</span><button type="button" aria-label="Copiar coordenadas" title={copied ? 'Copiado' : 'Copiar coordenadas'} onClick={async () => { await navigator.clipboard.writeText(coordinates); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }} className="rounded p-1 hover:bg-stone-200"><ClipboardDocumentIcon className="h-4 w-4" /></button></div></section>
        <section className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><h3 className="mb-2 text-xs font-bold text-stone-800">Reportes ciudadanos vinculados <span className="ml-1 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px]">{reports.length}</span></h3><div className="space-y-2">{reports.map((report, index) => { const expanded = openReportId === report.id || (openReportId === null && (selectedReport?.id === report.id || (!selectedReport && index === 0))); return <article key={report.id} className="rounded-lg border border-stone-200 bg-stone-50"><button type="button" aria-expanded={expanded} onClick={() => setOpenReportId(expanded ? -1 : report.id)} className="flex w-full items-center justify-between gap-2 p-2.5 text-left"><span className="min-w-0"><span className="block truncate text-xs font-semibold text-stone-900">{index === 0 ? 'Principal · ' : ''}{report.ciudadano.nombre}</span><span className="text-[11px] text-stone-500">{report.horaFormateada} · #{report.codigoTicket}</span></span><ChevronDownIcon className={`h-4 w-4 shrink-0 text-stone-500 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>{expanded && <div className="border-t border-stone-200 px-2.5 pb-2.5 pt-2"><p className="whitespace-pre-wrap text-xs leading-relaxed text-stone-700">{report.descripcion}</p>{report.ciudadano.telefono && <a href={`tel:${report.ciudadano.telefono.replace(/[^+\d]/g, '')}`} className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"><PhoneIcon className="h-4 w-4" />{report.ciudadano.telefono}</a>}</div>}</article>; })}</div></section>
        <section className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-stone-800"><CameraIcon className="h-4 w-4" />Evidencia de campo</h3>{evidence.length ? <div className="flex flex-wrap gap-2">{evidence.map(({ media, reportId, sender }) => <button key={`${reportId}-${media.id}`} type="button" onClick={() => setActiveMedia(media)} className="flex items-center gap-2 rounded-lg border border-stone-200 p-1.5 text-xs text-stone-700 hover:bg-stone-50">{media.tipo === 'image' ? <img src={media.url} alt="Miniatura de evidencia" className="h-12 w-14 rounded object-cover" /> : <CameraIcon className="h-7 w-7" />}<span className="max-w-36 truncate">{sender}</span></button>)}</div> : <p className="text-xs text-stone-500">Sin evidencia fotográfica adjunta.</p>}</section>
      </div>
      <div className={`shrink-0 border-t p-3 ${isBomberos ? 'border-[#ec5766]/20' : 'border-emerald-900/15'}`}><button type="button" disabled={completed} onClick={() => onUpdateStatus(incident.id, falseAlarm ? 'PENDIENTE' : pending ? 'EN_CURSO' : 'ATENDIDO')} className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:cursor-default ${isBomberos ? 'bg-[#c42348] hover:bg-[#a91d3d] disabled:bg-[#ef7674]' : 'bg-[#143601] hover:bg-[#1a4301] disabled:bg-emerald-700'}`}>{falseAlarm ? <ArrowUturnLeftIcon className="h-5 w-5" /> : pending ? <TruckIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}{falseAlarm ? 'Reabrir reporte' : pending ? 'Poner en curso' : completed ? 'Incidente atendido' : 'Marcar como atendido'}</button>{!falseAlarm && <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" disabled title="La derivación institucional no está disponible en el servicio actual" className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-2 text-[11px] font-medium text-stone-600 disabled:cursor-not-allowed disabled:opacity-60"><ArrowUturnRightIcon className="h-4 w-4" />{isBomberos ? 'Derivar a Policía' : 'Derivar a Bomberos'}</button><button type="button" onClick={() => onUpdateStatus(incident.id, 'FALSA_ALARMA')} className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-2 text-[11px] font-medium text-red-700 hover:bg-red-50"><XMarkIcon className="h-4 w-4" />Falsa alarma</button></div>}</div>
    </aside>
    <IncidentEvidenceModal adjunto={activeMedia} onClose={() => setActiveMedia(null)} />
  </>;
};
