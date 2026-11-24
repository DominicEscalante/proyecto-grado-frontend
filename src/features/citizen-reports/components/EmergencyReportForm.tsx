// Formulario de Reporte de Emergencias: Triage de 1 toque, Etiquetas de contexto rapido y Despacho de Doble Velocidad
// Exclusivamente con componentes de @heroicons/react y paleta global

import React, { useState } from 'react';
import {
  TruckIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  BellAlertIcon,
  FireIcon,
  LifebuoyIcon,
  ExclamationCircleIcon,
  HeartIcon,
  CheckIcon,
  SignalIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  TipoEmergenciaItem,
  EvidenciaArchivo,
  InstitucionDestino,
} from '../types/citizen-reports.types.js';
import { EvidenceUploader } from './EvidenceUploader.js';

interface EmergencyReportFormProps {
  institutionSelector: React.ReactNode;
  gpsCard: React.ReactNode;
  duplicateNotice: React.ReactNode;
  institucion: InstitucionDestino;
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

interface GridOptionDef {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  searchTerms: string[];
  fallbackId: number;
}

const POLICIA_OPTIONS: GridOptionDef[] = [
  {
    title: 'Accidente de Tránsito',
    icon: TruckIcon,
    searchTerms: ['accidente', 'tránsito', 'vehicular'],
    fallbackId: 1,
  },
  {
    title: 'Robo / Asalto',
    icon: ExclamationTriangleIcon,
    searchTerms: ['robo', 'asalto', 'hurto'],
    fallbackId: 2,
  },
  {
    title: 'Hecho de Violencia',
    icon: ShieldExclamationIcon,
    searchTerms: ['violencia', 'riña', 'agresión'],
    fallbackId: 3,
  },
  {
    title: 'Otra Emergencia',
    icon: BellAlertIcon,
    searchTerms: ['otra', 'general', 'policía'],
    fallbackId: 1,
  },
];

const BOMBEROS_OPTIONS: GridOptionDef[] = [
  {
    title: 'Incendio Estructural/Vehicular',
    icon: FireIcon,
    searchTerms: ['estructural', 'incendio', 'forestal'],
    fallbackId: 4,
  },
  {
    title: 'Rescate / Auxilio',
    icon: LifebuoyIcon,
    searchTerms: ['rescate', 'atrapamiento'],
    fallbackId: 7,
  },
  {
    title: 'Fuga de Gas / Peligro',
    icon: ExclamationCircleIcon,
    searchTerms: ['gas', 'fuga', 'químico'],
    fallbackId: 6,
  },
  {
    title: 'Emergencia Médica',
    icon: HeartIcon,
    searchTerms: ['médica', 'derrumbe', 'deslizamiento', 'inundación'],
    fallbackId: 8,
  },
];

const QUICK_TAGS = [
  'Hay heridos',
  'Peligro en curso',
  'Vía bloqueada',
  'Personas atrapadas',
];

export const EmergencyReportForm: React.FC<EmergencyReportFormProps> = ({
  institutionSelector,
  gpsCard,
  duplicateNotice,
  institucion,
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [manualNotes, setManualNotes] = useState<string>(indicacionesRapidas || '');
  // Opciones de la cuadricula segun institucion
  const gridOptions = institucion === 'POLICIA' ? POLICIA_OPTIONS : BOMBEROS_OPTIONS;

  // Resolver ID real de la base de datos para cada opcion del grid
  const resolveOptionId = (opt: GridOptionDef): number => {
    const match = incidentes.find((inc) => {
      const nombreLower = inc.nombre.toLowerCase();
      return opt.searchTerms.some((term) => nombreLower.includes(term));
    });
    return match ? Number(match.tipoEmergenciaId || match.id) : opt.fallbackId;
  };

  // Cada opción visible usa el nombre que el catálogo asigna al ID enviado.
  const catalogById = new Map(incidentes.map((item) => [Number(item.tipoEmergenciaId || item.id), item]));
  const optionsById = new Map<number, GridOptionDef>();
  for (const option of gridOptions) {
    const id = resolveOptionId(option);
    if (!optionsById.has(id)) optionsById.set(id, option);
  }

  const selectedId = Number(tipoEmergenciaId);
  const selectedIncident = catalogById.get(selectedId);
  const incidentName = selectedIncident?.nombre ?? optionsById.get(selectedId)?.title;

  // Alternar tag rapido y sincronizar inmediatamente con el texto de indicaciones
  const handleToggleTag = (tag: string) => {
    if (isSubmitting) return;
    const exists = selectedTags.includes(tag);
    const updatedTags = exists
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(updatedTags);

    const prefix = updatedTags.length > 0 ? updatedTags.map((t) => `[${t}]`).join(' ') : '';
    const fullText = prefix
      ? (manualNotes ? `${prefix} - ${manualNotes}` : prefix)
      : manualNotes;

    onChangeIndicaciones(fullText);
  };

  // Manejar edicion manual del textarea
  const handleManualNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setManualNotes(val);

    const prefix = selectedTags.length > 0 ? selectedTags.map((t) => `[${t}]`).join(' ') : '';
    const fullText = prefix ? (val ? `${prefix} - ${val}` : prefix) : val;
    onChangeIndicaciones(fullText);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 md:grid md:min-h-fit md:grid-cols-[minmax(0,2fr)_minmax(14rem,1fr)] md:auto-rows-[minmax(min-content,1fr)] md:gap-[clamp(1rem,2vw,1.5rem)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain md:overflow-visible lg:gap-4">
        <section aria-labelledby="incident-details-title" className="flex shrink-0 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm sm:p-2 md:p-2.5 lg:p-4">
          <h2 id="incident-details-title" className="sr-only">Datos del incidente</h2>
          {institutionSelector}

          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Tipo de incidente</legend>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(optionsById, ([optId, opt]) => {
                const isSelected = selectedId === optId;
                const catalogName = catalogById.get(optId)?.nombre;
                const IconComp = opt.icon;

                return (
                  <button
                    key={optId}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onSelectTipoEmergencia(optId)}
                    aria-pressed={isSelected}
                    className={`flex min-h-11 items-center gap-1.5 rounded-md border p-2 text-left md:px-3 lg:min-h-12 text-xs font-medium leading-tight lg:text-sm disabled:opacity-60 ${
                      isSelected
                        ? institucion === 'BOMBEROS'
                          ? 'border-red-700 bg-red-50/70 text-red-950'
                          : 'border-emerald-800 bg-emerald-50/70 text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <IconComp className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
                    <span className="min-w-0 break-words">{catalogName ?? opt.title}</span>
                  </button>
                );
              })}
              </div>

            {selectedIncident?.descripcion && (
              <p aria-live="polite" className="mt-1.5 whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs leading-snug text-slate-600 lg:text-sm">
                {selectedIncident.descripcion}
              </p>
            )}
          </fieldset>
        </section>

        <section aria-labelledby="report-context-title" className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm sm:p-2 md:gap-2 md:p-2.5 lg:p-4 flex-1 max-md:shrink-0">
          <h2 id="report-context-title" className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Contexto <span className="font-normal normal-case tracking-normal">(opcional)</span>
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={isSubmitting}
                  aria-pressed={isActive}
                  onClick={() => handleToggleTag(tag)}
                  className={`flex min-h-7 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium disabled:opacity-60 ${
                    isActive
                      ? 'border border-emerald-700 bg-emerald-50 text-emerald-950'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isActive ? (
                    <CheckIcon className="w-3.5 h-3.5 text-[#0F291E] stroke-[2.5]" />
                  ) : (
                    <span className="text-slate-400 font-bold">+</span>
                  )}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>

          <EvidenceUploader
            evidencias={evidencias}
            onAdjuntar={onAdjuntarEvidencias}
            onRemover={onRemoverEvidencia}
            onReemplazar={onReemplazarEvidencia}
            disabled={isSubmitting}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="indicaciones-rapidas" className="text-xs font-medium text-slate-800">Observaciones</label>
            <textarea
              id="indicaciones-rapidas"
              rows={2}
              maxLength={1800}
              disabled={isSubmitting}
              value={manualNotes}
              onChange={handleManualNotesChange}
              placeholder="Dirección de referencia o detalles…"
              className="min-h-11 w-full resize-none rounded-md border border-slate-300 bg-white p-2 text-base leading-tight text-slate-900 placeholder:text-slate-500 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 disabled:bg-slate-50 flex-1 md:min-h-14 md:text-sm"
            />
          </div>
          <p className="hidden text-xs text-slate-600 md:block">Puedes adjuntar fotos o videos MP4 y MOV de hasta 10 MB por archivo.</p>
        </section>
      </div>

      <aside className="flex min-w-0 shrink-0 flex-col gap-2.5 lg:gap-4">
        <div className="hidden md:block">{gpsCard}</div>
        <section aria-label="Resumen y envío" className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 md:flex-1 md:p-2.5 md:shadow-sm lg:p-4">
          <h2 className="sr-only text-[11px] font-semibold uppercase tracking-wider text-slate-600 md:not-sr-only">Resumen y envío</h2>
          <dl className="grid grid-cols-[repeat(3,minmax(0,1fr))] border-slate-200 text-xs max-md:divide-x max-md:divide-slate-200 md:block md:divide-y md:divide-slate-200 md:border-y lg:text-sm">
            <div className="py-1.5 max-md:space-y-0.5 max-md:px-1.5 md:grid md:grid-cols-2 md:gap-2">
              <dt className="text-slate-600">Institución</dt>
              <dd className="break-words font-medium text-slate-900">{institucion === 'POLICIA' ? 'Policía' : 'Bomberos'}</dd>
            </div>
            <div className="py-1.5 max-md:space-y-0.5 max-md:px-1.5 md:grid md:grid-cols-2 md:gap-2">
              <dt className="text-slate-600">Tipo de incidente</dt>
              <dd className="break-words font-medium text-slate-900">{incidentName ?? 'Por seleccionar'}</dd>
            </div>
            <div className="py-1.5 max-md:space-y-0.5 max-md:px-1.5 md:grid md:grid-cols-2 md:gap-2">
              <dt className="text-slate-600">Evidencia</dt>
              <dd className="font-medium text-slate-900">
                {evidencias.length ? `${evidencias.length} ${evidencias.length === 1 ? 'archivo' : 'archivos'}` : 'Sin adjuntos'}
              </dd>
            </div>
          </dl>
          {errorMessage && (
            <div role="alert" className="p-2.5 rounded-md bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <p className="font-medium leading-tight">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-1 md:mt-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onSubmit}
              className="flex min-h-12 w-full items-center lg:min-h-14 justify-center gap-2 rounded-lg bg-red-700 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:bg-red-700/60"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 text-white" />
                  <span>{submittingStep || 'Despachando SOS...'}</span>
                </>
              ) : (
                <>
                  <SignalIcon className="h-5 w-5 stroke-[2.4] text-white" />
                  <span>Enviar alerta SOS</span>
                </>
              )}
            </button>

            <p className="hidden text-center text-xs text-slate-600 md:block">
              Despacho inmediato con tu ubicación GPS actual
            </p>
          </div>

          {duplicateNotice}
        </section>
      </aside>

    </div>
  );
};
