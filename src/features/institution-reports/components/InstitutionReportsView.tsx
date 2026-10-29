import React, { useState } from 'react';
import { InformationCircleIcon, ListBulletIcon, MapIcon } from '@heroicons/react/24/outline';
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
  const { filteredIncidents, selectedIncident, selectedIncidentId, activeCount, isLoading, busqueda, setBusqueda, setSelectedIncidentId, cambiarEstadoIncidente } = useInstitutionReports(institution);
  const [mobileView, setMobileView] = useState<'lista' | 'mapa' | 'detalle'>('mapa');
  return <div className={`flex h-screen w-screen flex-col overflow-hidden font-sans text-stone-900 ${isBomberos ? 'bg-[#FBF1F0]' : 'bg-[#EEF4F0]'}`}>
    <InstitutionHeader />
    <div className={`z-20 flex shrink-0 items-center justify-around border-b px-2 py-2 md:hidden ${isBomberos ? 'border-[#ec5766]/20 bg-[#FBF1F0]' : 'border-emerald-900/15 bg-[#EEF4F0]'}`}>
      {([['lista', ListBulletIcon, `Incidentes (${activeCount})`], ['mapa', MapIcon, 'Mapa'], ['detalle', InformationCircleIcon, 'Detalle']] as const).map(([view, Icon, label]) => <button key={view} type="button" onClick={() => setMobileView(view)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${mobileView === view ? isBomberos ? 'bg-[#c42348] text-white' : 'bg-emerald-50 text-[#143601]' : 'text-stone-500'}`}><Icon className="h-4 w-4" />{label}</button>)}
    </div>
    <main className="relative flex flex-1 overflow-hidden">
      <div className={`${mobileView === 'lista' ? 'flex w-full' : 'hidden md:flex'} h-full`}><ActiveIncidentsList incidents={filteredIncidents} selectedIncidentId={selectedIncidentId} onSelectIncident={(incident) => { setSelectedIncidentId(incident.id); if (window.matchMedia('(max-width: 767px)').matches) setMobileView('detalle'); }} busqueda={busqueda} onBusquedaChange={setBusqueda} isLoading={isLoading} isBomberos={isBomberos} /></div>
      <div className={`${mobileView === 'mapa' ? 'flex w-full' : 'hidden md:flex'} h-full min-w-0 flex-1`}><IncidentMap incidents={filteredIncidents} selectedIncident={selectedIncident} onSelectIncident={setSelectedIncidentId} isBomberos={isBomberos} /></div>
      <div className={`${mobileView === 'detalle' ? 'flex w-full' : 'hidden md:flex'} h-full`}><IncidentDetailInspector incident={selectedIncident} onUpdateStatus={cambiarEstadoIncidente} isBomberos={isBomberos} /></div>
    </main>
  </div>;
};
