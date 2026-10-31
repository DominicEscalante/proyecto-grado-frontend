// Tipos de dominio para la Consola Operativa y Reportes de Instituciones (Feature-First)

export type InstitucionTipo = 'POLICIA' | 'BOMBEROS';

export type EstadoIncidente =
  | 'PENDIENTE'
  | 'EN_CURSO'
  | 'ATENDIDO'
  | 'FALSA_ALARMA';

export type PrioridadIncidente = 'ALTA' | 'MEDIA' | 'BAJA';

export interface CiudadanoInfo {
  nombre: string;
  telefono: string;
  ci?: string;
}

export interface Coordenadas {
  latitud: number;
  longitud: number;
  altitud: number;
  referencia: string;
}

export interface AdjuntoMedia {
  id: string | number;
  url: string;
  tipo: 'image' | 'video';
  formato: string;
  nombre?: string;
}

export interface IncidenteInstitucional {
  id: number;
  incidentePrincipalId?: number | null;
  cantidadReportes?: number;
  reportesVinculados?: IncidenteInstitucional[];
  codigoTicket: string;
  titulo: string;
  tipoEmergencia: string;
  institucion: InstitucionTipo;
  estado: EstadoIncidente;
  prioridad: PrioridadIncidente;
  fechaReporte: string;
  fechaCierre?: string;
  horaFormateada: string;
  ciudadano: CiudadanoInfo;
  coordenadas: Coordenadas;
  adjuntos: AdjuntoMedia[];
  descripcion: string;
  ultimaActualizacion: {
    hora: string;
    responsable: string;
  };
}

export interface FiltroIncidente {
  institucion: 'TODAS' | InstitucionTipo;
  estado: 'TODOS' | 'ACTIVOS' | EstadoIncidente;
  busqueda: string;
}

export interface ZonaCalor {
  latitud: number;
  longitud: number;
  radioMetros: number;
  cantidadReportes: number;
  intensidad: 'ALTA' | 'MEDIA';
}
