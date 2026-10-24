import React from 'react';
import { ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CompactHeaderSummaryProps {
  onExportCsv: () => void;
  onNewOperator: () => void;
}

export const CompactHeaderSummary: React.FC<CompactHeaderSummaryProps> = ({
  onExportCsv,
  onNewOperator,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
      {/* Título y Subtítulo en Verde Más Oscuro de la Paleta (#143601) */}
      <div>
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#143601] leading-tight">
          Directorio Institucional y Control de Cuentas
        </h1>
        <p className="text-[11px] sm:text-xs text-stone-500 leading-tight">
          Supervisión de credenciales, roles asignados y acceso operativo en tiempo real.
        </p>
      </div>

      {/* Botones de Acción Global en la Esquina Superior Derecha */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 hover:border-[#245501] text-stone-700 hover:text-[#143601] text-xs font-semibold transition-all shadow-2xs focus:outline-none"
          title="Descargar datos filtrados en formato CSV"
        >
          <ArrowDownTrayIcon className="w-3.5 h-3.5 text-stone-500" />
          <span>Exportar CSV</span>
        </button>

        <button
          type="button"
          onClick={onNewOperator}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#245501] hover:bg-[#1a4301] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs focus:outline-none"
        >
          <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo Operador</span>
        </button>
      </div>
    </div>
  );
};
