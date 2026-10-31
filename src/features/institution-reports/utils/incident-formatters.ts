// Utilidades y formateadores para la consola de emergencias de instituciones

import { EstadoIncidente, InstitucionTipo } from '../types/institution-reports.types.js';

export function formatTiempoRelativo(fechaIso: string): string {
  try {
    const ahora = new Date();
    const fecha = new Date(fechaIso);
    const diffSegundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

    if (diffSegundos < 60) {
      return 'Reportado hace un momento';
    }
    const diffMinutos = Math.floor(diffSegundos / 60);
    if (diffMinutos < 60) {
      return `Reportado hace ${diffMinutos} ${diffMinutos === 1 ? 'minuto' : 'minutos'}`;
    }
    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) {
      return `Reportado hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    }
    const diffDias = Math.floor(diffHoras / 24);
    return `Reportado hace ${diffDias} ${diffDias === 1 ? 'dia' : 'dias'}`;
  } catch {
    return 'Reportado recientemente';
  }
}

export function formatCoordenadaLat(lat: number): string {
  const cardinal = lat < 0 ? 'S' : 'N';
  return `${lat.toFixed(4)}° ${cardinal}`;
}

export function formatCoordenadaLng(lng: number): string {
  const cardinal = lng < 0 ? 'W' : 'E';
  return `${Math.abs(lng).toFixed(4)}° ${cardinal}`;
}

export function formatAltitud(alt: number): string {
  return `${Math.round(alt || 3640)} msnm`;
}

export interface BadgeConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export function getEstadoBadgeConfig(estado: EstadoIncidente): BadgeConfig {
  switch (estado) {
    case 'PENDIENTE':
      return {
        label: 'Pendiente',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500',
      };
    case 'EN_CURSO':
      return {
        label: 'En Curso',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'ATENDIDO':
      return {
        label: 'Atendido',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'FALSA_ALARMA':
      return {
        label: 'Falsa Alarma',
        badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
        dotClass: 'bg-stone-400',
      };
    default:
      return {
        label: estado,
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
        dotClass: 'bg-stone-400',
      };
  }
}

export function getInstitucionBadgeConfig(institucion: InstitucionTipo): {
  label: string;
  badgeClass: string;
} {
  if (institucion === 'POLICIA') {
    return {
      label: 'POLICIA',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    };
  }
  return {
    label: 'BOMBEROS',
    badgeClass: 'bg-red-50 text-red-700 border border-red-200',
  };
}
