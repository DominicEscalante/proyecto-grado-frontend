// Modal de Confirmacion y Notificacion de Alerta SOS Enviada

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Phone, ArrowRight } from 'lucide-react';
import { ReporteCreadoResult } from '../types/citizen-reports.types.js';

interface ReportSuccessModalProps {
  reporte: ReporteCreadoResult | null;
  onClose: () => void;
  onVerMisAlertas?: () => void;
}

export const ReportSuccessModal: React.FC<ReportSuccessModalProps> = ({
  reporte,
  onClose,
  onVerMisAlertas,
}) => {
  const [copied, setCopied] = useState(false);

  if (!reporte) return null;

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(reporte.codigoTicket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const telefonoEmergencia = reporte.institucionDestino === 'BOMBEROS' ? '119' : '110';
  const nombreInstitucion =
    reporte.institucionDestino === 'BOMBEROS' ? 'Bomberos Antofagasta' : 'Radio Patrullas 110';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-sm space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        {/* Icono de Exito */}
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Alerta SOS enviada
          </h2>
          <p className="text-xs text-slate-600">
            Tu reporte ha sido georreferenciado y remitido a la central de despacho.
          </p>
        </div>

        {/* Tarjeta de Ticket Correlativo */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Ticket de Seguimiento</span>
            <span className="font-bold text-[#0F291E]">
              {reporte.institucionDestino}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-slate-200">
            <span className="text-base font-extrabold font-mono text-[#0F291E] tracking-wider">
              {reporte.codigoTicket}
            </span>
            <button
              type="button"
              onClick={handleCopyTicket}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Copiar código de ticket"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {reporte.tipoEmergenciaNombre && (
            <p className="text-sm text-slate-600 text-left">
              <span className="font-semibold text-slate-700">Incidente:</span>{' '}
              {reporte.tipoEmergenciaNombre}
            </p>
          )}
        </div>

        {/* Llamada Directa de Respaldo */}
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-left flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-amber-900">
              ¿Situación crítica de alto riesgo?
            </p>
            <p className="text-xs text-amber-800">
              Comunícate directamente con {nombreInstitucion}.
            </p>
          </div>
          <a
            href={`tel:${telefonoEmergencia}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold font-mono transition-colors shadow-xs"
          >
            <Phone className="w-3 h-3" />
            {telefonoEmergencia}
          </a>
        </div>

        {/* Acciones */}
        <div className="space-y-2 pt-1">
          {onVerMisAlertas && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onVerMisAlertas();
              }}
              className="w-full py-2.5 px-4 rounded-md bg-[#0F291E] hover:bg-[#1a4301] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Ver mis alertas y estado</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-md text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Realizar otro reporte
          </button>
        </div>
      </div>
    </div>
  );
};
