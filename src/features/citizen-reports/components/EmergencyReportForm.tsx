// Formulario Principal de Reporte de Emergencias segun el Mockup de Diseno

import React from 'react';
import { ChevronsUpDown, Radio, AlertTriangle, Loader2 } from 'lucide-react';
import { TipoEmergenciaItem, EvidenciaArchivo } from '../types/citizen-reports.types.js';
import { EvidenceUploader } from './EvidenceUploader.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/index.js';

interface EmergencyReportFormProps {
  incidentes: TipoEmergenciaItem[];
  tipoEmergenciaId: number;
  indicacionesRapidas: string;
  evidencias: EvidenciaArchivo[];
  isSubmitting: boolean;
  submittingStep: string | null;
  errorMessage: string | null;
  onSelectTipoEmergencia: (id: number) => void;
  onChangeIndicaciones: (texto: string) => void;
  onAdjuntarEvidencias: (files: FileList | null) => void;
  onRemoverEvidencia: (id: string) => void;
  onReemplazarEvidencia?: (targetId: string, files: FileList | null) => void;
  onSubmit: () => void;
}

export const EmergencyReportForm: React.FC<EmergencyReportFormProps> = ({
  incidentes,
  tipoEmergenciaId,
  indicacionesRapidas,
  evidencias,
  isSubmitting,
  submittingStep,
  errorMessage,
  onSelectTipoEmergencia,
  onChangeIndicaciones,
  onAdjuntarEvidencias,
  onRemoverEvidencia,
  onReemplazarEvidencia,
  onSubmit,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Tarjeta Contenedora Principal (Mockup) */}
      <div className="w-full bg-white rounded-2xl border border-stone-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3.5">
        {/* 1. Selector de Tipo de Incidente (Componente Shadcn Combobox / Select) */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-stone-800 tracking-tight">
            Tipo de Incidente
          </label>

          <Select
            value={tipoEmergenciaId ? String(tipoEmergenciaId) : undefined}
            onValueChange={(val) => onSelectTipoEmergencia(Number(val))}
            disabled={isSubmitting}
          >
            <SelectTrigger
              icon={<ChevronsUpDown className="w-4 h-4 text-stone-500 stroke-[2.5]" />}
              className="w-full h-11 bg-[#F1F5F9] hover:bg-[#E2E8F0]/80 border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#143601]/20 focus:border-[#143601] transition-colors cursor-pointer shadow-2xs"
            >
              <SelectValue placeholder="Selecciona el tipo de incidente" />
            </SelectTrigger>

            <SelectContent className="max-h-72 rounded-xl bg-white border border-stone-200 shadow-xl p-1 z-50">
              {incidentes.map((item) => {
                const itemKey = item.tipoEmergenciaId || item.id;
                return (
                  <SelectItem
                    key={itemKey}
                    value={String(itemKey)}
                    className="rounded-lg py-2 pl-8 pr-3 text-xs sm:text-sm font-semibold text-stone-800 focus:bg-stone-100 focus:text-[#143601] cursor-pointer"
                  >
                    {item.nombre}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Breve descripcion del incidente seleccionado */}
          {(() => {
            const seleccionado = incidentes.find(
              (i) => (i.tipoEmergenciaId || i.id) === tipoEmergenciaId
            );
            return seleccionado?.descripcion ? (
              <p className="text-[11px] text-stone-500 pt-0.5 leading-tight">
                {seleccionado.descripcion}
              </p>
            ) : null;
          })()}
        </div>

        {/* 2. Seccion de Evidencias Multimedia */}
        <EvidenceUploader
          evidencias={evidencias}
          onAdjuntar={onAdjuntarEvidencias}
          onRemover={onRemoverEvidencia}
          onReemplazar={onReemplazarEvidencia}
          disabled={isSubmitting}
        />

        {/* 3. Indicaciones Rapidas (Texto abierto) */}
        <div className="space-y-1">
          <label
            htmlFor="indicaciones-rapidas"
            className="block text-xs font-bold text-stone-800 tracking-tight"
          >
            Indicaciones Rapidas
          </label>

          <textarea
            id="indicaciones-rapidas"
            rows={2}
            disabled={isSubmitting}
            value={indicacionesRapidas}
            onChange={(e) => onChangeIndicaciones(e.target.value)}
            placeholder="Ej: Incendio de una casa"
            className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0]/80 focus:bg-white border border-stone-200 text-stone-900 text-xs sm:text-sm rounded-xl p-2.5 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143601]/20 focus:border-[#143601] transition-all resize-none disabled:opacity-50"
          />
        </div>
      </div>

      {/* Banner de Mensaje de Error */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="font-medium leading-tight">{errorMessage}</p>
        </div>
      )}

      {/* 4. Boton Enviar Alerta SOS (Mockup) */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="w-full py-3 px-4 rounded-xl bg-[#d9534f] hover:bg-[#c9302c] active:scale-[0.98] text-white font-black text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all select-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{submittingStep || 'Despachando SOS...'}</span>
          </>
        ) : (
          <>
            {/* Icono de Antena / Radio de Emergencia del Mockup */}
            <div className="relative flex items-center justify-center">
              <Radio className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span>Enviar Alerta SOS</span>
          </>
        )}
      </button>
    </div>
  );
};
