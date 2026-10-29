// Peticiones HTTP del modulo de Reportes Ciudadanos

import { apiClient, handleApiError } from '../../../api/client.js';
import {
  CrearReportePayload,
  ReporteCreadoResult,
  TipoEmergenciaItem,
  InstitucionDestino,
  ReporteCiudadanoResumen,
} from '../types/citizen-reports.types.js';
import {
  CATALOGO_EMERGENCIAS_DEFAULT,
  normalizarTipoEmergencia,
} from '../utils/report-formatters.js';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Consulta el catalogo de emergencias filtrado opcionalmente por institucion.
 */
export async function getCatalogoEmergenciasApi(
  institucion?: InstitucionDestino
): Promise<TipoEmergenciaItem[]> {
  try {
    const params = institucion ? { institucion } : {};
    const response = await apiClient.get<ApiResponse<any[]>>(
      '/api/ciudadano/emergencias',
      { params }
    );
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data.map(normalizarTipoEmergencia);
    }
    return CATALOGO_EMERGENCIAS_DEFAULT.map(normalizarTipoEmergencia);
  } catch (error) {
    // Si la llamada falla o no hay conexion, retornamos catalogo de contingencia
    console.warn('Utilizando catalogo local de emergencias por indisponibilidad de red:', error);
    return CATALOGO_EMERGENCIAS_DEFAULT.map(normalizarTipoEmergencia);
  }
}

/**
 * Registra un nuevo reporte ciudadano de emergencia (HU-04).
 */
export async function crearReporteApi(
  payload: CrearReportePayload
): Promise<ReporteCreadoResult> {
  try {
    const response = await apiClient.post<ApiResponse<ReporteCreadoResult>>(
      '/api/ciudadano/reportes',
      payload
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Carga evidencias fotograficas o videos adjuntos al reporte creado.
 */
export async function adjuntarEvidenciasApi(
  codigoTicket: string,
  archivos: File[]
): Promise<void> {
  if (!archivos || archivos.length === 0) return;

  try {
    const formData = new FormData();
    archivos.forEach((file) => {
      formData.append('archivos', file);
    });

    await apiClient.post(
      `/api/ciudadano/reportes/${encodeURIComponent(codigoTicket)}/adjuntos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error) {
    console.error('Error al subir evidencias multimedia:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Obtiene el listado de reportes del ciudadano autenticado ("Mis Reportes").
 */
export async function getMisReportesApi(
  pagina = 1,
  limite = 20
): Promise<{ reportes: ReporteCiudadanoResumen[]; total: number }> {
  try {
    const response = await apiClient.get<
      ApiResponse<{
        items?: Record<string, unknown>[];
        reportes?: Record<string, unknown>[];
        total?: number;
      }>
    >('/api/ciudadano/reportes', {
      params: { pagina, limite },
    });

    const dataObj = response.data?.data;
    const rawList: Record<string, unknown>[] = Array.isArray(dataObj?.items)
      ? dataObj.items
      : Array.isArray(dataObj?.reportes)
      ? dataObj.reportes
      : Array.isArray(dataObj)
      ? (dataObj as unknown as Record<string, unknown>[])
      : [];

    const reportesNormalizados: ReporteCiudadanoResumen[] = rawList.map((raw) => {
      let nombreTipo = 'Emergencia';
      if (typeof raw.tipoEmergencia === 'object' && raw.tipoEmergencia !== null) {
        nombreTipo = String((raw.tipoEmergencia as { nombre?: string }).nombre || 'Emergencia');
      } else if (typeof raw.tipoEmergencia === 'string' && raw.tipoEmergencia.trim()) {
        nombreTipo = raw.tipoEmergencia;
      } else if (typeof raw.tipoEmergenciaNombre === 'string' && raw.tipoEmergenciaNombre.trim()) {
        nombreTipo = raw.tipoEmergenciaNombre;
      }

      return {
        reporteId: Number(raw.reporteId) || 0,
        codigoTicket: String(raw.codigoTicket || ''),
        estado: (raw.estado as ReporteCiudadanoResumen['estado']) || 'PENDIENTE',
        institucionDestino: (raw.institucionDestino as ReporteCiudadanoResumen['institucionDestino']) || 'POLICIA',
        tipoEmergencia: nombreTipo,
        descripcion: String(raw.descripcion || ''),
        fechaRegistro: String(
          raw.fechaGeneracionLocal || raw.fechaRegistro || raw.actualizadoEn || new Date().toISOString()
        ),
        latitud: Number(raw.latitud) || 0,
        longitud: Number(raw.longitud) || 0,
        adjuntosCount: Number(raw.totalAdjuntos ?? raw.adjuntosCount ?? 0),
        primerAdjuntoUrl: (raw.primerAdjuntoUrl as string) || null,
      };
    });

    return {
      reportes: reportesNormalizados,
      total: typeof dataObj?.total === 'number' ? dataObj.total : reportesNormalizados.length,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
