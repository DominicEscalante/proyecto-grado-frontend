import React, { useState } from 'react';
import {
  CitizenHeader,
  InstitutionSelector,
  GpsStatusBar,
  EmergencyReportForm,
  ReportSuccessModal,
  CitizenBottomNav,
  CitizenAlertsList,
  CitizenProfileTab,
  useCitizenReportForm,
  CitizenTab,
} from '../features/citizen-reports/index.js';

export const CitizenDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CitizenTab>('reportar');

  const {
    gps,
    institucion,
    tipoEmergenciaId,
    indicacionesRapidas,
    evidencias,
    incidentesFiltrados,
    isSubmitting,
    submittingStep,
    errorMessage,
    successReport,
    cambiarInstitucion,
    setTipoEmergenciaId,
    setIndicacionesRapidas,
    handleAdjuntarArchivos,
    handleRemoverEvidencia,
    handleReemplazarEvidencia,
    handleEnviarReporte,
    handleCerrarExito,
  } = useCitizenReportForm();

  return (
    <div className="min-h-screen w-full bg-[#F4F7F4] text-[#143601] flex flex-col justify-between selection:bg-[#143601] selection:text-white">
      {/* 1. Encabezado Superior Institucional */}
      <CitizenHeader onGoHome={() => setActiveTab('reportar')} />

      {/* 2. Contenedor Principal Optimizado para Vista Movil */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 sm:px-4 py-2.5 sm:py-4">
        {/* Pestana 1: Envio de Reporte SOS (Mockup) */}
        {activeTab === 'reportar' && (
          <div className="space-y-2.5 pb-20 animate-fadeIn">
            {/* Selector de Institucion Destino: Policia / Bomberos */}
            <InstitutionSelector
              selected={institucion}
              onSelect={cambiarInstitucion}
              disabled={isSubmitting}
            />

            {/* Banner de Sincronizacion GPS */}
            <GpsStatusBar gps={gps} />

            {/* Formulario Principal de Incidente y Evidencias */}
            <EmergencyReportForm
              incidentes={incidentesFiltrados}
              tipoEmergenciaId={tipoEmergenciaId}
              indicacionesRapidas={indicacionesRapidas}
              evidencias={evidencias}
              isSubmitting={isSubmitting}
              submittingStep={submittingStep}
              errorMessage={errorMessage}
              onSelectTipoEmergencia={setTipoEmergenciaId}
              onChangeIndicaciones={setIndicacionesRapidas}
              onAdjuntarEvidencias={handleAdjuntarArchivos}
              onRemoverEvidencia={handleRemoverEvidencia}
              onReemplazarEvidencia={handleReemplazarEvidencia}
              onSubmit={handleEnviarReporte}
            />
          </div>
        )}

        {/* Pestana 2: Alertas / Mis Reportes */}
        {activeTab === 'alertas' && (
          <CitizenAlertsList onNuevoReporte={() => setActiveTab('reportar')} />
        )}

        {/* Pestana 3: Perfil del Ciudadano */}
        {activeTab === 'perfil' && <CitizenProfileTab />}
      </main>

      {/* 3. Modal de Confirmacion de Alerta SOS */}
      <ReportSuccessModal
        reporte={successReport}
        onClose={handleCerrarExito}
        onVerMisAlertas={() => setActiveTab('alertas')}
      />

      {/* 4. Barra de Navegacion Inferior Fija para Movil */}
      <CitizenBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
