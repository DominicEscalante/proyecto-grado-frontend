// Listado de alertas y reportes previos del ciudadano ("Mis Reportes")

import React from 'react';
import { useMisReportes } from '../hooks/useMisReportes.js';
import { formatFechaReporte } from '../utils/report-formatters.js';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, RefreshCw, Paperclip } from 'lucide-react';

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
      case 'ASIGNADO':
      case 'DESPACHADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            En Camino
          </span>
        );
      case 'ATENDIDO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Atendido
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3" />
            Rechazado
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
    <div className="w-full space-y-4 pb-20 animate-fadeIn">
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
        {reportes.map((rep) => (
          <div
            key={rep.codigoTicket || rep.reporteId}
            className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-stone-300 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold font-mono text-[#143601]">
                {rep.codigoTicket}
              </span>
              {getStatusBadge(rep.estado)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    rep.institucionDestino === 'BOMBEROS'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {rep.institucionDestino}
                </span>
                <span className="text-xs font-bold text-stone-800 truncate">
                  {typeof rep.tipoEmergencia === 'object' && rep.tipoEmergencia !== null
                    ? (rep.tipoEmergencia as { nombre?: string }).nombre
                    : rep.tipoEmergencia}
                </span>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2">
                {rep.descripcion}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-500 font-mono">
              <span>{formatFechaReporte(rep.fechaRegistro)}</span>
              {rep.adjuntosCount ? (
                <span className="flex items-center gap-1 text-stone-600">
                  <Paperclip className="w-3 h-3" />
                  {rep.adjuntosCount} evidencia(s)
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
