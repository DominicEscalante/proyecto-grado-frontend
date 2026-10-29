// Hook para la inicializacion y ciclo de vida del mapa interactivo con Leaflet

import React, { useEffect, useRef, useCallback } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FireIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import { IncidenteInstitucional } from '../types/institution-reports.types.js';
import { buildHeatZones } from '../utils/heat-zones.js';

interface UseMapIncidentMarkersOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  incidents: IncidenteInstitucional[];
  selectedIncident: IncidenteInstitucional | null;
  onSelectIncident: (id: number) => void;
  showHeatmap?: boolean;
  mapStyle?: 'light';
  isBomberos?: boolean;
}

const LA_PAZ_CENTRO: [number, number] = [-16.5000, -68.1500];

export function useMapIncidentMarkers({
  containerRef,
  incidents,
  selectedIncident,
  onSelectIncident,
  showHeatmap = true,
  mapStyle = 'light',
  isBomberos = false,
}: UseMapIncidentMarkersOptions) {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const createBaseLayers = (_style: 'light') => ({
    base: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }),
  });

  // Inicializacion del mapa Leaflet
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Crear mapa Leaflet
    const map = L.map(containerRef.current, {
      center: LA_PAZ_CENTRO,
      zoom: 13,
      zoomControl: false, // Usamos controles personalizados
      attributionControl: true,
    });

    const { base: tileLayer } = createBaseLayers(mapStyle);
    tileLayer.addTo(map);

    tileLayerRef.current = tileLayer;

    // Grupos de capas
    const markersLayer = L.layerGroup().addTo(map);
    const heatLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    heatLayerRef.current = heatLayer;
    mapRef.current = map;

    // Redimensionar correctamente tras montaje
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      heatLayerRef.current = null;
      tileLayerRef.current = null;
    };
  }, [containerRef]);

  // Actualizacion reactiva de la capa de teselas segun el estilo seleccionado
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const { base: newTileLayer } = createBaseLayers(mapStyle);
    newTileLayer.addTo(mapRef.current);

    // Asegurar que las teselas queden debajo de marcadores y capas de calor
    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Derive hotspot zones from the current reports instead of static city-wide circles.
  useEffect(() => {
    if (!mapRef.current || !heatLayerRef.current) return;

    const layer = heatLayerRef.current;
    layer.clearLayers();

    if (!showHeatmap) return;

    buildHeatZones(incidents).forEach((zona) => {
      const isAlta = zona.intensidad === 'ALTA';
      const color = isBomberos ? (isAlta ? '#d91e36' : '#ef7674') : (isAlta ? '#dc2626' : '#d97706');
      const fillColor = isBomberos ? (isAlta ? '#d91e36' : '#ef7674') : (isAlta ? '#dc2626' : '#f59e0b');

      const circle = L.circle([zona.latitud, zona.longitud], {
        radius: zona.radioMetros,
        color: color,
        weight: 1.25,
        opacity: 0.5,
        fillColor: fillColor,
        fillOpacity: isAlta ? 0.24 : 0.14,
      });

      circle.bindTooltip(
        `${zona.cantidadReportes} reportes próximos`,
        { direction: 'top', sticky: true }
      );
      circle.addTo(layer);
    });
  }, [incidents, showHeatmap, isBomberos]);

  // Actualizacion de marcadores en el mapa
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    incidents.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const isPolicia = inc.institucion === 'POLICIA';
      const IncidentIcon = isPolicia ? ShieldCheckIcon : FireIcon;
      const iconMarkup = renderToStaticMarkup(React.createElement(IncidentIcon, { className: 'h-4 w-4 text-white' }));

      // Diseno de icono personalizado con Tailwind inline
      const isPending = inc.estado === 'PENDIENTE';
      const primaryColor = isBomberos ? (isPending ? '#d91e36' : '#da344d') : (isPending ? '#dc2626' : '#d97706');
      const glowColor = isBomberos
        ? isPending ? 'rgba(217, 30, 54, 0.24)' : 'rgba(218, 52, 77, 0.24)'
        : isPending ? 'rgba(220, 38, 38, 0.2)' : 'rgba(217, 119, 6, 0.2)';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
          ${
            isSelected
              ? `<div class="absolute -inset-3 rounded-full animate-ping opacity-60" style="background-color: ${glowColor};"></div>
                 <div class="absolute -right-3 -top-1 w-3.5 h-3.5 rounded-full bg-white shadow-lg border-2 border-stone-500"></div>`
              : ''
          }
              <div class="relative flex items-center justify-center w-9 h-9 rounded-full shadow-lg transition-all"
               style="background-color: ${primaryColor}; box-shadow: 0 0 15px ${glowColor}; border: 2px solid ${
        isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'
      };">
            ${iconMarkup}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([inc.coordenadas.latitud, inc.coordenadas.longitud], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', () => {
        onSelectIncident(inc.id);
      });

      marker.addTo(layer);
    });
  }, [incidents, selectedIncident, onSelectIncident, isBomberos]);

  // Centrar mapa suavemente al seleccionar un incidente
  useEffect(() => {
    if (!mapRef.current || !selectedIncident) return;

    mapRef.current.flyTo(
      [selectedIncident.coordenadas.latitud, selectedIncident.coordenadas.longitud],
      14,
      {
        duration: 1.0,
      }
    );
  }, [selectedIncident]);

  // Controles del mapa
  const zoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const resetCenter = useCallback(() => {
    mapRef.current?.setView(LA_PAZ_CENTRO, 13);
  }, []);

  return {
    map: mapRef.current,
    zoomIn,
    zoomOut,
    resetCenter,
  };
}
