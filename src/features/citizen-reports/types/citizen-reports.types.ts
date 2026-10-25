// Tipos de dominio para el modulo de Reportes Ciudadanos (Feature-First)

export type InstitucionDestino = 'POLICIA' | 'BOMBEROS';

export interface TipoEmergenciaItem {
  tipoEmergenciaId: number;
  id: number; // Alias para retrocompatibilidad
  nombre: string;
  descripcion: string;
  institucion: InstitucionDestino | 'AMBOS';
  activo: boolean;
}

export interface GpsCoordinates {
  latitud: number;
  longitud: number;
  altitud: number;
  precisionMetros: number;
  timestamp: number;
}

export type GpsStatus = 'idle' | 'obtaining' | 'synchronized' | 'error' | 'denied';

export interface GpsLocationState {
  status: GpsStatus;
  coords: GpsCoordinates | null;
  errorMessage: string | null;
  isSimulated?: boolean;
}

export interface EvidenciaArchivo {
  id: string;
  file: File;
  previewUrl: string;
  tipo: 'image' | 'video';
  tamanoFormateado: string;
}

export interface CrearReportePayload {
  institucion_destino: InstitucionDestino;
  tipo_emergencia_id: number;
  descripcion: string;
  latitud: number;
  longitud: number;
  altitud?: number;
  referencia_direccion: string;
  fecha_generacion_local?: string;
}

export interface ReporteCreadoResult {
  reporteId: number;
  codigoTicket: string;
  estado: string;
  fechaRegistro: string;
  institucionDestino: InstitucionDestino;
  tipoEmergenciaNombre?: string;
}

export interface ReporteCiudadanoResumen {
  reporteId: number;
  codigoTicket: string;
  estado: 'PENDIENTE' | 'ASIGNADO' | 'DESPACHADO' | 'ATENDIDO' | 'RECHAZADO';
  institucionDestino: InstitucionDestino;
  tipoEmergencia: string;
  descripcion: string;
  fechaRegistro: string;
  latitud: number;
  longitud: number;
  adjuntosCount?: number;
}

export type CitizenTab = 'reportar' | 'alertas' | 'perfil';
