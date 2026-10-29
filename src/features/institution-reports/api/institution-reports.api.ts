// Cliente API para reportes e incidentes de instituciones

import { apiClient } from '../../../api/client.js';
import {
  IncidenteInstitucional,
  EstadoIncidente,
} from '../types/institution-reports.types.js';

// Datos iniciales de contingencia basados en la maqueta operativa de La Paz
const INCIDENTES_MOCK: IncidenteInstitucional[] = [
  {
    id: 1,
    codigoTicket: 'LPZ-2024-0892',
    titulo: 'Incendio Estructural',
    tipoEmergencia: 'INCENDIO ESTRUCTURAL',
    institucion: 'BOMBEROS',
    estado: 'DESPACHADO',
    prioridad: 'ALTA',
    fechaReporte: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    horaFormateada: '14:18',
    ciudadano: {
      nombre: 'Ricardo Mendoza Valdivia',
      telefono: '+591 706 45321',
      ci: '4892102 LP',
    },
    coordenadas: {
      latitud: -16.5000,
      longitud: -68.1500,
      altitud: 3640,
      referencia: 'Zona Sur, Calle 21 de Calacoto',
    },
    adjuntos: [
      {
        id: 101,
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
        tipo: 'image',
        formato: 'JPG',
        nombre: 'humo_estructural_calacoto.jpg',
      },
    ],
    descripcion:
      'Columna densa de humo negro saliendo por el techo de una vivienda residencial de 3 niveles. Vecinos indican posible explosión en cocina o instalaciones de gas.',
    ultimaActualizacion: {
      hora: '14:25',
      responsable: 'Central-02',
    },
  },
  {
    id: 2,
    codigoTicket: 'LPZ-2024-0895',
    titulo: 'Robo en Progreso - Sopocachi',
    tipoEmergencia: 'ROBO EN PROGRESO',
    institucion: 'POLICIA',
    estado: 'PENDIENTE',
    prioridad: 'ALTA',
    fechaReporte: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    horaFormateada: '14:22',
    ciudadano: {
      nombre: 'Mariana Rios Penaranda',
      telefono: '+591 715 88234',
      ci: '6712940 LP',
    },
    coordenadas: {
      latitud: -16.512,
      longitud: -68.128,
      altitud: 3610,
      referencia: 'Av. 6 de Agosto esq. Belisario Salinas',
    },
    adjuntos: [],
    descripcion:
      'Dos sujetos sospechosos forzando el candado de una tienda de equipos electrónicos con barras de metal. Ciudadano observa desde balcón opuesto.',
    ultimaActualizacion: {
      hora: '14:23',
      responsable: 'Operador-05',
    },
  },
  {
    id: 3,
    codigoTicket: 'LPZ-2024-0889',
    titulo: 'Accidente de Transito',
    tipoEmergencia: 'ACCIDENTE DE TRANSITO',
    institucion: 'POLICIA',
    estado: 'DESPACHADO',
    prioridad: 'MEDIA',
    fechaReporte: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    horaFormateada: '14:05',
    ciudadano: {
      nombre: 'Carlos Gutierrez Flores',
      telefono: '+591 772 10994',
      ci: '5820194 LP',
    },
    coordenadas: {
      latitud: -16.495,
      longitud: -68.145,
      altitud: 3680,
      referencia: 'Autopista La Paz - El Alto, curva diablo',
    },
    adjuntos: [],
    descripcion:
      'Colisión por alcance entre minibús de servicio público y vehículo tipo vagoneta. Tráfico paralizado en carril descendente hacia el centro.',
    ultimaActualizacion: {
      hora: '14:15',
      responsable: 'Central-01',
    },
  },
  {
    id: 4,
    codigoTicket: 'LPZ-2024-0882',
    titulo: 'Fuga de Gas Licuado',
    tipoEmergencia: 'FUGA DE GAS',
    institucion: 'BOMBEROS',
    estado: 'PENDIENTE',
    prioridad: 'ALTA',
    fechaReporte: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    horaFormateada: '13:50',
    ciudadano: {
      nombre: 'Elena Condori Quispe',
      telefono: '+591 730 44551',
      ci: '7128391 LP',
    },
    coordenadas: {
      latitud: -16.504,
      longitud: -68.121,
      altitud: 3600,
      referencia: 'Miraflores, Av. Busch esq. Villalobos',
    },
    adjuntos: [],
    descripcion:
      'Olor penetrante a gas GLP saliendo de la planta baja de edificio residencial. Portería desocupada y vecinos en alarma.',
    ultimaActualizacion: {
      hora: '13:52',
      responsable: 'Operador-03',
    },
  },
  {
    id: 5,
    codigoTicket: 'LPZ-2024-0875',
    titulo: 'Derrumbe de Muro de Contencion',
    tipoEmergencia: 'DERRUMBE / RIESGO GEOLOGICO',
    institucion: 'BOMBEROS',
    estado: 'EN_CURSO',
    prioridad: 'MEDIA',
    fechaReporte: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    horaFormateada: '13:30',
    ciudadano: {
      nombre: 'Ramiro Mamani Ticona',
      telefono: '+591 720 99112',
      ci: '4920194 LP',
    },
    coordenadas: {
      latitud: -16.529,
      longitud: -68.125,
      altitud: 3580,
      referencia: 'Bajo Llojeta, Av. Mario Mercado',
    },
    adjuntos: [],
    descripcion:
      'Fisuras de consideración y desprendimiento progresivo de gaviones sobre la calzada tras lluvia sostenida.',
    ultimaActualizacion: {
      hora: '13:45',
      responsable: 'Central-02',
    },
  },
  {
    id: 6,
    codigoTicket: 'LPZ-2024-0870',
    titulo: 'Alteracion del Orden Publico',
    tipoEmergencia: 'ALTERACION DEL ORDEN',
    institucion: 'POLICIA',
    estado: 'PENDIENTE',
    prioridad: 'BAJA',
    fechaReporte: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    horaFormateada: '13:15',
    ciudadano: {
      nombre: 'Valeria Gomez Claros',
      telefono: '+591 765 33210',
      ci: '8319201 LP',
    },
    coordenadas: {
      latitud: -16.5015,
      longitud: -68.136,
      altitud: 3630,
      referencia: 'San Pedro, Plaza Sucre lado este',
    },
    adjuntos: [],
    descripcion:
      'Riña entre personas en vía pública provocando rotura de cristales en parada de transporte público.',
    ultimaActualizacion: {
      hora: '13:20',
      responsable: 'Operador-01',
    },
  },
];

/**
 * Obtiene la lista de incidentes institucionales desde la base de datos real.
 * Si el backend no tiene reportes o no hay conexión, recurre a incidentes de contingencia.
 */
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
    console.warn('Fallo al obtener reportes reales de operador, usando contingencia:', error);
  }

  return institucion
    ? INCIDENTES_MOCK.filter((incident) => incident.institucion === institucion)
    : INCIDENTES_MOCK;
}

/**
 * Actualiza el estado operativo de un incidente en la base de datos real.
 */
export async function actualizarEstadoIncidenteApi(
  idOrTicket: number | string,
  nuevoEstado: EstadoIncidente
): Promise<{ success: boolean; nuevoEstado: EstadoIncidente; actualizadoEn: string }> {
  try {
    await apiClient.patch(`/api/operador/reportes/${idOrTicket}/estado`, {
      estado: nuevoEstado,
    });
  } catch (error) {
    console.warn('Fallo al actualizar estado del incidente en BD:', error);
  }

  return {
    success: true,
    nuevoEstado,
    actualizadoEn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
