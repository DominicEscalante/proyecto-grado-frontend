import React, { useState } from 'react';
import { CitizenGpsCard } from '../features/citizen-reports/components/CitizenGpsCard.js';
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
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-slate-50 text-slate-900">
      {/* 1. Header Compacto con Estado GPS Integrado */}
      <CitizenHeader
        gps={gps}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 2. Contenedor Principal Ergonomico Mobile-First */}
      <main className={`mx-auto min-h-0 w-full flex-1 px-3 md:px-6 ${
        activeTab === 'reportar'
          ? 'flex max-w-7xl flex-col gap-2 overflow-y-auto py-2 md:gap-4 md:py-[clamp(0.5rem,2dvh,1.25rem)] xl:px-8'
          : 'max-w-6xl overflow-y-auto py-4'
      }`}>
        {evidenceUpload === 'uploading' && <p role="status" className="shrink-0 rounded-md bg-sky-50 p-2 text-xs text-sky-900">Reporte recibido. Adjuntando evidencia en segundo plano.</p>}
        {evidenceUpload === 'failed' && <div role="alert" className="flex shrink-0 items-center justify-between gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900"><span>El reporte se recibió; falta adjuntar la evidencia.</span><button type="button" onClick={retryEvidenceUpload} className="font-bold underline">Reintentar</button></div>}
        {activeTab === 'reportar' && (
          <>
            <h1 className="sr-only md:not-sr-only md:shrink-0 md:text-xl md:font-semibold md:tracking-tight lg:text-2xl">Reportar una emergencia</h1>
            <EmergencyReportForm
              institutionSelector={<InstitutionSelector selected={institucion} onSelect={cambiarInstitucion} disabled={isSubmitting} />}
              gpsCard={<CitizenGpsCard gps={gps} />}
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
              duplicateNotice={avisoCoincidencia && (
                <div role="status" className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p>{avisoCoincidencia}</p>
                  <button type="button" onClick={enviarReporteIndependiente} className="rounded-md bg-amber-900 px-3 py-2 font-semibold text-white">
                    Enviar reporte independiente
                  </button>
                </div>
              )}
            />
          </>
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
        <div className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
          <h2 id="coincidencia-titulo" className="text-lg font-bold">Hay un reporte cercano</h2>
          <p className="text-sm text-stone-700">Se registró una alerta de {incidentesFiltrados.find((item) => (item.tipoEmergenciaId || item.id) === tipoEmergenciaId)?.nombre ?? 'este tipo'} a unos {coincidencia.distanciaMetros} metros, a las {new Date(coincidencia.fechaReporte).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}. ¿Se trata del mismo incidente?</p>
          <button type="button" onClick={confirmarCoincidencia} className="w-full rounded-lg bg-[#0F291E] p-3 font-semibold text-white">Sí, es el mismo incidente</button>
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
