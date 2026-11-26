
import { apiClient } from '../../../api/client.js';
import {
  IncidenteInstitucional,
  EstadoIncidente,
} from '../types/institution-reports.types.js';

export async function getInstitutionalIncidentsApi(institucion?: 'POLICIA' | 'BOMBEROS'): Promise<IncidenteInstitucional[]> {
  try {
    const res = await apiClient.get('/api/operador/reportes', {
      params: institucion ? { institucion } : undefined,
    });
    const rawList = res.data?.data;

    if (Array.isArray(rawList)) {
      return rawList as IncidenteInstitucional[];
    }
  } catch (error) {
    console.error('Fallo al obtener reportes de operador:', error);
    throw error;
  }
  throw new Error('Respuesta inválida al consultar reportes de operador.');
}

export interface HistorialIncidentes {
  items: IncidenteInstitucional[];
  total: number;
  pagina: number;
  limite: 20;
  totalPaginas: number;
}

export async function getInstitutionalHistoryApi(pagina: number, orden: 'recientes' | 'antiguos', signal?: AbortSignal): Promise<HistorialIncidentes> {
  const response = await apiClient.get<{ data: HistorialIncidentes }>('/api/operador/reportes/historial', {
    params: { pagina, orden }, signal,
  });
  return response.data.data;
}

export async function actualizarEstadoIncidenteApi(
  idOrTicket: number | string,
  nuevoEstado: EstadoIncidente,
  estadoEsperado: EstadoIncidente,
): Promise<{ success: boolean; nuevoEstado: EstadoIncidente; actualizadoEn: string }> {
  try {
    await apiClient.patch(`/api/operador/reportes/${idOrTicket}/estado`, {
      estado: nuevoEstado,
      estadoEsperado,
    });
  } catch (error) {
    console.warn('Fallo al actualizar estado del incidente en BD:', error);
    throw error;
  }

  return {
    success: true,
    nuevoEstado,
    actualizadoEn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
