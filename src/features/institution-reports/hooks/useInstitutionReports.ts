// Hook para la gestion del estado de reportes e incidentes institucionales

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  IncidenteInstitucional,
  EstadoIncidente,
  InstitucionTipo,
} from '../types/institution-reports.types.js';
import {
  getInstitutionalIncidentsApi,
  actualizarEstadoIncidenteApi,
} from '../api/institution-reports.api.js';

export function useInstitutionReports(initialInstitucionFilter?: InstitucionTipo) {
  const [incidents, setIncidents] = useState<IncidenteInstitucional[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusConflict, setStatusConflict] = useState<string | null>(null);
  const [newIncident, setNewIncident] = useState<IncidenteInstitucional | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const knownReports = useRef<Set<string> | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const polling = useRef(false);
  const refreshQueued = useRef(false);
  const updating = useRef(new Set<number>());

  // Filtros operativos
  const [institucionFiltro, setInstitucionFiltro] = useState<'TODAS' | InstitucionTipo>(
    initialInstitucionFilter || 'TODAS'
  );
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | 'ACTIVOS' | EstadoIncidente>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Carga inicial de incidentes
  const cargarIncidentes: (initial?: boolean) => Promise<void> = useCallback(async (initial = false) => {
    if (polling.current) { refreshQueued.current = true; return; }
    polling.current = true;
    if (initial) setIsLoading(true);
    try {
      const data = await getInstitutionalIncidentsApi(initialInstitucionFilter);
      const received = new Set(data.flatMap((incident) => (incident.reportesVinculados?.length ? incident.reportesVinculados : [incident]).map((report) => report.codigoTicket)));
      if (knownReports.current) {
        const incoming = data.find((incident) => (incident.reportesVinculados?.length ? incident.reportesVinculados : [incident]).some((report) => !knownReports.current!.has(report.codigoTicket)));
        if (incoming) {
          setNewIncident(incoming);
          if (audioContext.current) {
            const context = audioContext.current;
            if (context.state === 'suspended') void context.resume();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.value = 880;
            gain.gain.setValueAtTime(0.12, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
            oscillator.connect(gain).connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.35);
          }
        }
      }
      knownReports.current = received;
      setIncidents(data);
      setError(null);
      if (data.length > 0) {
        // Seleccionar por defecto el primer incidente relevante (ej. LPZ-2024-0892 si existe)
        const principal = data[0];
        setSelectedIncidentId((prev) => prev ?? principal.id);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al sincronizar incidentes');
    } finally {
      if (initial) setIsLoading(false);
      polling.current = false;
      if (refreshQueued.current) {
        refreshQueued.current = false;
        queueMicrotask(() => void cargarIncidentes());
      }
    }
  }, [initialInstitucionFilter]);

  useEffect(() => {
    void cargarIncidentes(true);
  }, [cargarIncidentes]);

  useEffect(() => {
    const controller = new AbortController();
    const connect = async () => {
      while (!controller.signal.aborted) {
        try {
          const headers: Record<string, string> = {};
          const token = localStorage.getItem('auth_token');
          if (token) headers.Authorization = `Bearer ${token}`;
          if (import.meta.env.DEV) {
            const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
            if (user?.id) { headers['x-dev-user-id'] = user.id; headers['x-dev-rol-id'] = String(user.rol_id); }
          }
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/operador/reportes/eventos`, { headers, credentials: 'include', signal: controller.signal });
          if (!response.ok || !response.body) throw new Error('Canal de eventos no disponible');
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (!controller.signal.aborted) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const messages = buffer.split('\n\n');
            buffer = messages.pop() || '';
            if (messages.some((message) => message.startsWith('data:'))) void cargarIncidentes();
          }
        } catch {
          if (controller.signal.aborted) break;
        }
        await new Promise<void>((resolve) => window.setTimeout(resolve, 2000));
      }
    };
    void connect();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void cargarIncidentes(); }, 15000);
    const refresh = () => { if (document.visibilityState === 'visible') void cargarIncidentes(); };
    document.addEventListener('visibilitychange', refresh);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); audioContext.current?.close(); audioContext.current = null; };
  }, [cargarIncidentes]);

  const enableSound = useCallback(() => {
    audioContext.current ??= new AudioContext();
    void audioContext.current.resume();
    setSoundEnabled(true);
  }, []);

  // Actualizacion de estado
  const cambiarEstadoIncidente = useCallback(
    async (id: number, nuevoEstado: EstadoIncidente) => {
      if (updating.current.has(id)) return;
      const targetInc = incidents.find((inc) => inc.id === id);
      if (!targetInc) return;
      updating.current.add(id);
      setStatusConflict(null);
      // Actualizacion optimista en el estado local
      const horaActual = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === id) {
            return {
              ...inc,
              estado: nuevoEstado,
              reportesVinculados: inc.reportesVinculados?.map((reporte) => ({ ...reporte, estado: nuevoEstado })),
              ultimaActualizacion: {
                hora: horaActual,
                responsable: 'Operador Activo',
              },
            };
          }
          return inc;
        })
      );

      const ticketOrId = targetInc.codigoTicket;

      try {
        await actualizarEstadoIncidenteApi(ticketOrId, nuevoEstado, targetInc.estado);
      } catch (err) {
        console.warn('Fallo al persistir estado en servidor:', err);
        setStatusConflict(axios.isAxiosError(err) && err.response?.status === 409
          ? 'Otro operador cambió este incidente antes. Se recargó la información; revisa su nuevo estado o el Historial.'
          : 'No se pudo guardar el cambio de estado. Revisa el incidente e inténtalo de nuevo.');
        await cargarIncidentes();
      } finally {
        updating.current.delete(id);
      }
    },
    [incidents, cargarIncidentes]
  );

  // Incidente seleccionado
  const selectedIncident = useMemo(() => {
    return incidents.find((inc) => inc.id === selectedIncidentId && inc.estado !== 'ATENDIDO') || null;
  }, [incidents, selectedIncidentId]);

  // Lista filtrada
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (inc.estado === 'ATENDIDO') return false;
      // Filtro de institucion
      if (institucionFiltro !== 'TODAS' && inc.institucion !== institucionFiltro) {
        return false;
      }

      // Filtro de estado
      if (estadoFiltro === 'ACTIVOS') {
        if (inc.estado === 'FALSA_ALARMA') {
          return false;
        }
      } else if (estadoFiltro !== 'TODOS' && inc.estado !== estadoFiltro) {
        return false;
      }

      // Busqueda de texto
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideTitulo = inc.titulo.toLowerCase().includes(query);
        const coincideTicket = inc.codigoTicket.toLowerCase().includes(query);
        const coincideCiudadano = inc.ciudadano.nombre.toLowerCase().includes(query);
        const coincideReporte = inc.reportesVinculados?.some((reporte) =>
          reporte.codigoTicket.toLowerCase().includes(query) || reporte.ciudadano.nombre.toLowerCase().includes(query)
        );
        const coincideLugar = inc.coordenadas.referencia.toLowerCase().includes(query);
        if (!coincideTitulo && !coincideTicket && !coincideCiudadano && !coincideReporte && !coincideLugar) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, institucionFiltro, estadoFiltro, busqueda]);

  // Conteo total de incidentes activos
  const activeCount = useMemo(() => {
    return incidents.filter(
      (inc) => inc.estado === 'PENDIENTE' || inc.estado === 'EN_CURSO'
    ).length;
  }, [incidents]);

  return {
    incidents,
    filteredIncidents,
    selectedIncident,
    selectedIncidentId,
    activeCount,
    isLoading,
    error,
    statusConflict,
    dismissStatusConflict: () => setStatusConflict(null),
    newIncident,
    dismissNewIncident: () => setNewIncident(null),
    soundEnabled,
    enableSound,
    institucionFiltro,
    estadoFiltro,
    busqueda,
    setInstitucionFiltro,
    setEstadoFiltro,
    setBusqueda,
    setSelectedIncidentId,
    cambiarEstadoIncidente,
    recargar: () => cargarIncidentes(true),
  };
}
