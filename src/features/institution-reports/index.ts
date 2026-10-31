// Barrel export de la funcionalidad de reportes de instituciones (Feature-First)

export * from './types/institution-reports.types.js';
export * from './hooks/useInstitutionReports.js';
export * from './hooks/useMapIncidentMarkers.js';
export * from './api/institution-reports.api.js';
export * from './utils/incident-formatters.js';

// Componentes publicos
export { InstitutionReportsView } from './components/InstitutionReportsView.js';
export { OperatorHistoryView } from './components/OperatorHistoryView.js';
export { InstitutionHeader } from './components/InstitutionHeader.js';
export { ActiveIncidentsList } from './components/ActiveIncidentsList.js';
export { IncidentCard } from './components/IncidentCard.js';
export { IncidentMap } from './components/IncidentMap.js';
export { MapLegend } from './components/MapLegend.js';
export { IncidentDetailInspector } from './components/IncidentDetailInspector.js';
export { IncidentEvidenceModal } from './components/IncidentEvidenceModal.js';
