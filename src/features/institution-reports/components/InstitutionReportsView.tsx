import React, { useState } from 'react';
import { BellAlertIcon, InformationCircleIcon, ListBulletIcon, MapIcon, SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext.js';
import { useInstitutionReports } from '../hooks/useInstitutionReports.js';
import { InstitutionHeader } from './InstitutionHeader.js';
import { ActiveIncidentsList } from './ActiveIncidentsList.js';
import { IncidentMap } from './IncidentMap.js';
import { IncidentDetailInspector } from './IncidentDetailInspector.js';

export const InstitutionReportsView: React.FC = () => {
  const { user } = useAuth();
  const institution = user?.institucion ?? (user?.rol_id === 3 ? 'BOMBEROS' : user?.rol_id === 2 ? 'POLICIA' : undefined);
  const isBomberos = institution === 'BOMBEROS';
  const { filteredIncidents, selectedIncident, selectedIncidentId, activeCount, isLoading, error, statusConflict, dismissStatusConflict, newIncident, dismissNewIncident, soundEnabled, enableSound, busqueda, setBusqueda, setSelectedIncidentId, cambiarEstadoIncidente } = useInstitutionReports(institution);
  const [mobileView, setMobileView] = useState<'lista' | 'mapa' | 'detalle'>('mapa');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const selectedReport = selectedIncident?.reportesVinculados?.find((report) => report.id === selectedReportId) ?? null;
  return <div className={`flex h-screen w-screen flex-col overflow-hidden font-sans text-stone-900 ${isBomberos ? 'bg-[#FBF1F0]' : 'bg-[#EEF4F0]'}`}>
    <InstitutionHeader />
    {!soundEnabled && <button type="button" onClick={enableSound} className={`z-20 flex items-center justify-center gap-2 border-b px-3 py-1.5 text-xs font-semibold ${isBomberos ? 'border-rose-200 bg-rose-50 text-[#a91d3d]' : 'border-emerald-200 bg-emerald-50 text-[#143601]'}`}><SpeakerWaveIcon className="h-4 w-4" />Activar alertas sonoras</button>}
    {newIncident && <div role="alert" className={`z-20 flex items-center gap-2 border-b px-4 py-2 text-sm font-semibold ${isBomberos ? 'border-rose-200 bg-rose-50 text-[#a91d3d]' : 'border-emerald-200 bg-emerald-50 text-[#143601]'}`}><BellAlertIcon className="h-5 w-5 shrink-0" /><span className="min-w-0 flex-1 truncate">Nuevo reporte: {newIncident.titulo} · {newIncident.coordenadas.referencia}</span><button type="button" onClick={() => { setSelectedIncidentId(newIncident.id); setMobileView('detalle'); dismissNewIncident(); }} className="rounded border border-current px-2 py-1 text-xs">Ver</button><button type="button" onClick={dismissNewIncident} aria-label="Cerrar alerta"><XMarkIcon className="h-4 w-4" /></button></div>}
    {error && <div role="status" className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">Sin conexión con la central. Reintentando automáticamente.</div>}
    {statusConflict && <div role="alert" className="z-20 flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"><span>{statusConflict}</span><button type="button" onClick={dismissStatusConflict} aria-label="Cerrar aviso" className="rounded p-1 hover:bg-amber-100"><XMarkIcon className="h-4 w-4" /></button></div>}
    <div className={`z-20 flex shrink-0 items-center justify-around border-b px-2 py-2 md:hidden ${isBomberos ? 'border-[#ec5766]/20 bg-[#FBF1F0]' : 'border-emerald-900/15 bg-[#EEF4F0]'}`}>
      {([['lista', ListBulletIcon, `Incidentes (${activeCount})`], ['mapa', MapIcon, 'Mapa'], ['detalle', InformationCircleIcon, 'Detalle']] as const).map(([view, Icon, label]) => <button key={view} type="button" onClick={() => setMobileView(view)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${mobileView === view ? isBomberos ? 'bg-[#c42348] text-white' : 'bg-emerald-50 text-[#143601]' : 'text-stone-500'}`}><Icon className="h-4 w-4" />{label}</button>)}
    </div>
    <main className="relative flex flex-1 overflow-hidden">
      <div className={`${mobileView === 'lista' ? 'flex w-full' : 'hidden md:flex'} h-full`}><ActiveIncidentsList incidents={filteredIncidents} selectedIncidentId={selectedIncidentId} selectedReportId={selectedReportId} onSelectIncident={(incident) => { setSelectedIncidentId(incident.id); setSelectedReportId(null); if ((incident.reportesVinculados?.length ?? 1) === 1 && window.matchMedia('(max-width: 767px)').matches) setMobileView('detalle'); }} onSelectReport={(incident, report) => { setSelectedIncidentId(incident.id); setSelectedReportId(report.id); if (window.matchMedia('(max-width: 767px)').matches) setMobileView('detalle'); }} busqueda={busqueda} onBusquedaChange={setBusqueda} isLoading={isLoading} isBomberos={isBomberos} /></div>
      <div className={`${mobileView === 'mapa' ? 'flex w-full' : 'hidden md:flex'} h-full min-w-0 flex-1`}><IncidentMap incidents={filteredIncidents} selectedIncident={selectedIncident} onSelectIncident={(id) => { setSelectedIncidentId(id); setSelectedReportId(null); }} isBomberos={isBomberos} /></div>
      <div className={`${mobileView === 'detalle' ? 'flex w-full' : 'hidden md:flex'} h-full`}><IncidentDetailInspector incident={selectedIncident} selectedReport={selectedReport} onUpdateStatus={cambiarEstadoIncidente} isBomberos={isBomberos} /></div>
    </main>
  </div>;
};
