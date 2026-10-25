// Public API del modulo de Reportes Ciudadanos (Feature-First)

// Componentes UI de Negocio
export { CitizenHeader } from './components/CitizenHeader.js';
export { InstitutionSelector } from './components/InstitutionSelector.js';
export { GpsStatusBar } from './components/GpsStatusBar.js';
export { EvidenceUploader } from './components/EvidenceUploader.js';
export { EmergencyReportForm } from './components/EmergencyReportForm.js';
export { ReportSuccessModal } from './components/ReportSuccessModal.js';
export { CitizenBottomNav } from './components/CitizenBottomNav.js';
export { CitizenAlertsList } from './components/CitizenAlertsList.js';
export { CitizenProfileTab } from './components/CitizenProfileTab.js';

// Hooks
export { useGpsLocation } from './hooks/useGpsLocation.js';
export { useCitizenReportForm } from './hooks/useCitizenReportForm.js';
export { useMisReportes } from './hooks/useMisReportes.js';

// Tipos
export type {
  InstitucionDestino,
  TipoEmergenciaItem,
  GpsLocationState,
  GpsCoordinates,
  EvidenciaArchivo,
  CrearReportePayload,
  ReporteCreadoResult,
  ReporteCiudadanoResumen,
  CitizenTab,
} from './types/citizen-reports.types.js';

// Utilidades
export {
  CATALOGO_EMERGENCIAS_DEFAULT,
  COORDENADAS_DEFAULT_LA_PAZ,
  filtrarIncidentesPorInstitucion,
  normalizarTipoEmergencia,
  formatBytes,
  formatFechaReporte,
} from './utils/report-formatters.js';
