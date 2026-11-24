import type { IncidenteInstitucional } from '../types/institution-reports.types.js';

const laPazDate = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function filterDispatchIncidents(
  incidents: IncidenteInstitucional[],
  state: 'PENDIENTES' | 'EN_CURSO' | 'FALSA_ALARMA',
  type: string,
  from: string,
  to: string,
): IncidenteInstitucional[] {
  const expectedState = state === 'PENDIENTES' ? 'PENDIENTE' : state;
  return incidents.filter((incident) => {
    if (incident.estado !== expectedState || (type && incident.tipoEmergencia !== type)) return false;
    if (!from && !to) return true;

    const reports = incident.reportesVinculados?.length ? incident.reportesVinculados : [incident];
    return reports.some((report) => {
      const timestamp = Date.parse(report.fechaReporte);
      if (!Number.isFinite(timestamp)) return false;
      const date = laPazDate.format(timestamp);
      return (!from || date >= from) && (!to || date <= to);
    });
  });
}
