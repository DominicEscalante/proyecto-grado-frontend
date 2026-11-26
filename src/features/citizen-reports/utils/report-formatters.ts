
import { TipoEmergenciaItem, InstitucionDestino } from '../types/citizen-reports.types.js';

export const MAX_EVIDENCE_FILES = 5;

export function normalizarTipoEmergencia(raw: any): TipoEmergenciaItem {
  const idNumerico = Number(raw.tipoEmergenciaId ?? raw.id ?? 1);
  return {
    tipoEmergenciaId: idNumerico,
    id: idNumerico,
    nombre: String(raw.nombre || ''),
    descripcion: String(raw.descripcion || ''),
    institucion: raw.institucion as InstitucionDestino | 'AMBOS',
    activo: raw.activo !== false,
  };
}

export const CATALOGO_EMERGENCIAS_DEFAULT: TipoEmergenciaItem[] = [
  {
    tipoEmergenciaId: 4,
    id: 4,
    nombre: 'Incendio Estructural',
    descripcion: 'Fuego activo en viviendas, comercios o infraestructura.',
    institucion: 'BOMBEROS',
    activo: true,
  },
  {
    tipoEmergenciaId: 5,
    id: 5,
    nombre: 'Incendio Forestal / Pastizales',
    descripcion: 'Quemas no controladas o vegetacion en llamas.',
    institucion: 'BOMBEROS',
    activo: true,
  },
  {
    tipoEmergenciaId: 6,
    id: 6,
    nombre: 'Fuga de Gas / Químicos',
    descripcion: 'Escape de gas licuado/natural o sustancias quimicas peligrosas.',
    institucion: 'BOMBEROS',
    activo: true,
  },
  {
    tipoEmergenciaId: 7,
    id: 7,
    nombre: 'Rescate / Atrapamiento',
    descripcion: 'Personas atrapadas en estructuras colapsadas o barrancos.',
    institucion: 'BOMBEROS',
    activo: true,
  },
  {
    tipoEmergenciaId: 8,
    id: 8,
    nombre: 'Derrumbe / Deslizamiento',
    descripcion: 'Movimientos de tierra, grietas activas o caida de muros.',
    institucion: 'BOMBEROS',
    activo: true,
  },
  {
    tipoEmergenciaId: 9,
    id: 9,
    nombre: 'Inundación / Desborde',
    descripcion: 'Desborde de rios, canales o acumulacion critica de agua.',
    institucion: 'BOMBEROS',
    activo: true,
  },
  {
    tipoEmergenciaId: 1,
    id: 1,
    nombre: 'Accidente de Tránsito',
    descripcion: 'Colisiones, atropellos o incidentes vehiculares.',
    institucion: 'POLICIA',
    activo: true,
  },
  {
    tipoEmergenciaId: 2,
    id: 2,
    nombre: 'Robo / Asalto',
    descripcion: 'Robo a mano armada, hurto o sustraccion de bienes.',
    institucion: 'POLICIA',
    activo: true,
  },
  {
    tipoEmergenciaId: 3,
    id: 3,
    nombre: 'Violencia / Riña Callejera',
    descripcion: 'Agresiones fisicas o alteracion del orden en via publica.',
    institucion: 'POLICIA',
    activo: true,
  },
];

/**
 * Coordenadas de contingencia del Municipio de La Paz (Centro Urbano)
 * Empleadas unicamente si el navegador no soporta GPS o para pruebas de desarrollo.
 */
export const COORDENADAS_DEFAULT_LA_PAZ = {
  latitud: -16.4998,
  longitud: -68.1345,
  altitud: 3640,
  precisionMetros: 15,
};

export function filtrarIncidentesPorInstitucion(
  tipos: TipoEmergenciaItem[],
  institucion: InstitucionDestino
): TipoEmergenciaItem[] {
  return tipos.filter(
    (item) => item.activo && (item.institucion === institucion || item.institucion === 'AMBOS')
  );
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatFechaReporte(fechaIso: string | Date | undefined | null): string {
  if (!fechaIso) return 'Reciente';
  try {
    const fecha = typeof fechaIso === 'string' ? new Date(fechaIso) : fechaIso;
    if (isNaN(fecha.getTime())) return String(fechaIso);
    return new Intl.DateTimeFormat('es-BO', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(fecha);
  } catch {
    return String(fechaIso);
  }
}
