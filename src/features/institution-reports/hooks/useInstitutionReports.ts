// Hook para la gestion del estado de reportes e incidentes institucionales

import { useState, useEffect, useMemo, useCallback } from 'react';
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

  // Filtros operativos
  const [institucionFiltro, setInstitucionFiltro] = useState<'TODAS' | InstitucionTipo>(
    initialInstitucionFilter || 'TODAS'
  );
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | 'ACTIVOS' | EstadoIncidente>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Carga inicial de incidentes
  const cargarIncidentes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInstitutionalIncidentsApi(initialInstitucionFilter);
      setIncidents(data);
      if (data.length > 0) {
        // Seleccionar por defecto el primer incidente relevante (ej. LPZ-2024-0892 si existe)
        const principal = data.find((item) => item.codigoTicket === 'LPZ-2024-0870') || data[0];
        setSelectedIncidentId((prev) => prev ?? principal.id);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al sincronizar incidentes');
    } finally {
      setIsLoading(false);
    }
  }, [initialInstitucionFilter]);

  useEffect(() => {
    cargarIncidentes();
  }, [cargarIncidentes]);

  // Actualizacion de estado
  const cambiarEstadoIncidente = useCallback(
    async (id: number, nuevoEstado: EstadoIncidente) => {
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
              ultimaActualizacion: {
                hora: horaActual,
                responsable: 'Operador Activo',
              },
            };
          }
          return inc;
        })
      );

      const targetInc = incidents.find((inc) => inc.id === id);
      const ticketOrId = targetInc?.codigoTicket || id;

      try {
        await actualizarEstadoIncidenteApi(ticketOrId, nuevoEstado);
      } catch (err) {
        console.warn('Fallo al persistir estado en servidor:', err);
      }
    },
    [incidents]
  );

  // Incidente seleccionado
  const selectedIncident = useMemo(() => {
    return incidents.find((inc) => inc.id === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);

  // Lista filtrada
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Filtro de institucion
      if (institucionFiltro !== 'TODAS' && inc.institucion !== institucionFiltro) {
        return false;
      }

      // Filtro de estado
      if (estadoFiltro === 'ACTIVOS') {
        if (inc.estado === 'ATENDIDO' || inc.estado === 'FALSA_ALARMA') {
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
        const coincideLugar = inc.coordenadas.referencia.toLowerCase().includes(query);
        if (!coincideTitulo && !coincideTicket && !coincideCiudadano && !coincideLugar) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, institucionFiltro, estadoFiltro, busqueda]);

  // Conteo total de incidentes activos
  const activeCount = useMemo(() => {
    return incidents.filter(
      (inc) => inc.estado === 'PENDIENTE' || inc.estado === 'DESPACHADO' || inc.estado === 'EN_CURSO'
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
    institucionFiltro,
    estadoFiltro,
    busqueda,
    setInstitucionFiltro,
    setEstadoFiltro,
    setBusqueda,
    setSelectedIncidentId,
    cambiarEstadoIncidente,
    recargar: cargarIncidentes,
  };
}
