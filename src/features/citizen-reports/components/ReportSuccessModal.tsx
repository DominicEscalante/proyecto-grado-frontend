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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-5 animate-slideInRight">
        {/* Icono de Exito */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#143601]">
            ¡Alerta SOS Enviada!
          </h2>
          <p className="text-xs text-stone-600">
            Tu reporte ha sido georreferenciado y remitido a la central de despacho.
          </p>
        </div>

        {/* Tarjeta de Ticket Correlativo */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Ticket de Seguimiento</span>
            <span className="font-bold text-[#143601]">
              {reporte.institucionDestino}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-stone-200">
            <span className="text-base font-extrabold font-mono text-[#143601] tracking-wider">
              {reporte.codigoTicket}
            </span>
            <button
              type="button"
              onClick={handleCopyTicket}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
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
            <p className="text-[11px] text-stone-600 text-left">
              <span className="font-semibold text-stone-700">Incidente:</span>{' '}
              {reporte.tipoEmergenciaNombre}
            </p>
          )}
        </div>

        {/* Llamada Directa de Respaldo */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-amber-900">
              ¿Situación crítica de alto riesgo?
            </p>
            <p className="text-[10px] text-amber-800">
              Comunícate directamente con {nombreInstitucion}.
            </p>
          </div>
          <a
            href={`tel:${telefonoEmergencia}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-mono transition-colors shadow-xs"
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
              className="w-full py-2.5 px-4 rounded-xl bg-[#143601] hover:bg-[#1a4301] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <span>Ver mis alertas y estado</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors"
          >
            Realizar otro reporte
          </button>
        </div>
      </div>
    </div>
  );
};
