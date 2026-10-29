import React, { useRef, useState } from 'react';
import { MinusIcon, PlusIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { IncidenteInstitucional } from '../types/institution-reports.types.js';
import { useMapIncidentMarkers } from '../hooks/useMapIncidentMarkers.js';
import { MapLegend } from './MapLegend.js';

interface Props { incidents: IncidenteInstitucional[]; selectedIncident: IncidenteInstitucional | null; onSelectIncident: (id: number) => void; isBomberos?: boolean; }

export const IncidentMap: React.FC<Props> = ({ incidents, selectedIncident, onSelectIncident, isBomberos = false }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const { zoomIn, zoomOut } = useMapIncidentMarkers({ containerRef: mapContainerRef, incidents, selectedIncident, onSelectIncident, showHeatmap, mapStyle: 'light', isBomberos });
  return <section className="relative h-full min-w-0 flex-1 overflow-hidden bg-stone-100">
    <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />
    <div className="absolute left-4 top-4 z-[1000] flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-md">
      <button type="button" onClick={zoomIn} aria-label="Acercar mapa" className="border-b border-stone-200 p-2.5 text-stone-700 hover:bg-stone-50"><PlusIcon className="h-4 w-4" /></button>
      <button type="button" onClick={zoomOut} aria-label="Alejar mapa" className="p-2.5 text-stone-700 hover:bg-stone-50"><MinusIcon className="h-4 w-4" /></button>
    </div>
    <button type="button" onClick={() => setShowHeatmap((show) => !show)} aria-label="Alternar zonas de calor" title="Alternar zonas de calor" className={`absolute left-4 top-[6.6rem] z-[1000] rounded-lg border border-stone-200 bg-white p-2.5 shadow-md hover:bg-stone-50 ${showHeatmap ? isBomberos ? 'text-[#c42348]' : 'text-[#143601]' : 'text-stone-500'}`}><Square3Stack3DIcon className="h-4 w-4" /></button>
    {showHeatmap && <MapLegend />}
  </section>;
};
