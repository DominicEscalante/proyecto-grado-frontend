// Listado de alertas y reportes previos del ciudadano ("Mis Reportes")

import React from 'react';
import { Content as DialogPanel } from '@radix-ui/react-dialog';
import { Dialog, DialogClose, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '../../../components/ui/dialog.js';
import { ReportAttachments } from './ReportAttachments.js';
import { useMisReportes } from '../hooks/useMisReportes.js';
import { formatFechaReporte } from '../utils/report-formatters.js';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, RefreshCw, Paperclip, ChevronRight, X } from 'lucide-react';

interface CitizenAlertsListProps {
  onNuevoReporte: () => void;
}

export const CitizenAlertsList: React.FC<CitizenAlertsListProps> = ({ onNuevoReporte }) => {
  const { reportes, total, isLoading, error, recargarReportes } = useMisReportes();

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'EN_CURSO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            En curso
          </span>
        );
      case 'ATENDIDO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Atendido
          </span>
        );
      case 'FALSA_ALARMA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3" />
            Falsa alarma
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header de Seccion */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#143601]">
            Mis Alertas ({total})
          </h2>
          <p className="text-xs text-stone-500">
            Historial de tickets y estado de atención
          </p>
        </div>

        <button
          type="button"
          onClick={recargarReportes}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors shadow-xs"
          title="Recargar historial"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Manejo de Error */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={recargarReportes}
            className="text-[11px] font-bold underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado Vacio */}
      {!isLoading && reportes.length === 0 && !error && (
        <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800">
              No tienes alertas registradas
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Cuando emitas un reporte de auxilio mediante el botón SOS, podrás rastrear su ticket aquí.
            </p>
          </div>
          <button
            type="button"
            onClick={onNuevoReporte}
            className="py-2 px-4 rounded-xl bg-[#143601] text-white text-xs font-bold hover:bg-[#1a4301] transition-colors"
          >
            Enviar primer reporte
          </button>
        </div>
      )}

      {/* Listado de Reportes */}
      <div className="space-y-3">
        {reportes.map((rep) => {
          const incidentName = typeof rep.tipoEmergencia === 'object' && rep.tipoEmergencia !== null
            ? (rep.tipoEmergencia as { nombre?: string }).nombre
            : rep.tipoEmergencia;
          const institution = rep.institucionDestino === 'BOMBEROS' ? 'Bomberos' : 'Policía';
          const date = formatFechaReporte(rep.fechaRegistro);

          return (
            <Dialog key={rep.codigoTicket || rep.reporteId}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="block w-full space-y-2.5 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="break-all font-mono text-xs font-semibold text-emerald-950">{rep.codigoTicket}</span>
                    {getStatusBadge(rep.estado)}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${rep.institucionDestino === 'BOMBEROS' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-900'}`}>
                      {institution}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{incidentName || 'Reporte de emergencia'}</span>
                  </span>
                  <span className="line-clamp-2 whitespace-pre-line break-words text-xs text-slate-600">{rep.descripcion}</span>
                  <span className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span>{date}</span>
                      {rep.adjuntosCount ? (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
                          {rep.adjuntosCount} {rep.adjuntosCount === 1 ? 'adjunto' : 'adjuntos'}
                        </span>
                      ) : null}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-900">
                      Ver detalles <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </span>
                </button>
              </DialogTrigger>

              <DialogPortal>
                <DialogOverlay className="bg-slate-950/50" />
                <DialogPanel
                  aria-describedby={undefined}
                  className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl motion-safe:animate-drawerBottomIn"
                >
                  <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6">
                    <div className="min-w-0 space-y-1">
                      <DialogTitle className="text-lg font-semibold leading-tight">Detalle del reporte</DialogTitle>
                      <p className="break-all font-mono text-xs font-medium text-slate-600">{rep.codigoTicket}</p>
                    </div>
                    <DialogClose aria-label="Cerrar detalles" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50">
                      <X aria-hidden="true" className="h-5 w-5" />
                    </DialogClose>
                  </header>

                  <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                    <section className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="break-words font-semibold text-slate-900">{incidentName || 'Reporte de emergencia'}</h3>
                        {getStatusBadge(rep.estado)}
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{rep.descripcion || 'Sin observaciones registradas.'}</p>
                    </section>

                    <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-600">Institución</dt>
                        <dd className="font-medium text-slate-900">{institution}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-600">Fecha de envío</dt>
                        <dd className="text-slate-900">{date}</dd>
                      </div>
                      {Number.isFinite(rep.latitud) && Number.isFinite(rep.longitud) && (rep.latitud !== 0 || rep.longitud !== 0) && (
                        <div>
                          <dt className="text-xs text-slate-600">Coordenadas</dt>
                          <dd className="break-words font-mono text-xs text-slate-900">{rep.latitud.toFixed(6)}, {rep.longitud.toFixed(6)}</dd>
                        </div>
                      )}
                    </dl>
                    <ReportAttachments ticket={rep.codigoTicket} />
                  </div>
                </DialogPanel>
              </DialogPortal>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
};
