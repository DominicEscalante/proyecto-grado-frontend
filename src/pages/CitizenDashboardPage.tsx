import React, { useState } from 'react';
import {
  CitizenHeader,
  InstitutionSelector,
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
    coincidencia,
    avisoCoincidencia,
    evidenceUpload,
    retryEvidenceUpload,
    confirmarCoincidencia,
    enviarReporteIndependiente,
    cancelarCoincidencia,
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
      {/* 1. Header Compacto con Estado GPS Integrado */}
      <CitizenHeader
        gps={gps}
        onGoHome={() => setActiveTab('reportar')}
      />

      {/* 2. Contenedor Principal Ergonomico Mobile-First */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 sm:px-4 py-2 sm:py-3">
        {evidenceUpload === 'uploading' && <p role="status" className="mb-2 rounded-lg bg-sky-50 p-2 text-xs text-sky-900">Reporte recibido. Adjuntando evidencia en segundo plano.</p>}
        {evidenceUpload === 'failed' && <div role="alert" className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900"><span>El reporte se recibió; falta adjuntar la evidencia.</span><button type="button" onClick={retryEvidenceUpload} className="font-bold underline">Reintentar</button></div>}
        {/* Pestana 1: Envio de Reporte SOS (Triage de 1 toque, Quick-Tags y Despacho Doble Velocidad) */}
        {activeTab === 'reportar' && (
          <div className="space-y-3 pb-20 animate-fadeIn">
            {/* Paso 1: Selector de Institucion de Alto Contraste (2 Columnas) */}
            <InstitutionSelector
              selected={institucion}
              onSelect={cambiarInstitucion}
              disabled={isSubmitting}
            />

            {/* Paso 2, 3 y Boton SOS: Formulario de Incidente, Contexto Rapido y Despacho Critico */}
            <EmergencyReportForm
              institucion={institucion}
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
            {avisoCoincidencia && <div role="status" className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><p>{avisoCoincidencia}</p><button type="button" onClick={enviarReporteIndependiente} className="rounded-lg bg-amber-900 px-3 py-2 font-semibold text-white">Enviar reporte independiente</button></div>}
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

      {coincidencia && <div role="dialog" aria-modal="true" aria-labelledby="coincidencia-titulo" className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-xl">
          <h2 id="coincidencia-titulo" className="text-lg font-bold">Hay un reporte cercano</h2>
          <p className="text-sm text-stone-700">Se registró una alerta de {incidentesFiltrados.find((item) => (item.tipoEmergenciaId || item.id) === tipoEmergenciaId)?.nombre ?? 'este tipo'} a unos {coincidencia.distanciaMetros} metros, a las {new Date(coincidencia.fechaReporte).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}. ¿Se trata del mismo incidente?</p>
          <button type="button" onClick={confirmarCoincidencia} className="w-full rounded-lg bg-[#143601] p-3 font-semibold text-white">Sí, es el mismo incidente</button>
          <button type="button" onClick={enviarReporteIndependiente} className="w-full rounded-lg border border-stone-300 p-3 font-semibold">No, es otro incidente</button>
          <button type="button" onClick={cancelarCoincidencia} className="w-full p-2 text-sm text-stone-600">Cancelar</button>
        </div>
      </div>}

      {/* 4. Barra de Navegacion Inferior Fija para Movil */}
      <CitizenBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
