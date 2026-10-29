// Formulario de Reporte de Emergencias: Triage de 1 toque, Etiquetas de contexto rapido y Despacho de Doble Velocidad
// Exclusivamente con componentes de @heroicons/react y paleta global

import React, { useState, useRef } from 'react';
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
  CameraIcon,
  SignalIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  TipoEmergenciaItem,
  EvidenciaArchivo,
  InstitucionDestino,
} from '../types/citizen-reports.types.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/index.js';

interface EmergencyReportFormProps {
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
  onSubmit,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [manualNotes, setManualNotes] = useState<string>(indicacionesRapidas || '');
  const [selectedForView, setSelectedForView] = useState<EvidenciaArchivo | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  // Incidente seleccionado actualmente para mostrar su descripcion breve
  const selectedIncident = incidentes.find(
    (inc) => (inc.tipoEmergenciaId || inc.id) === tipoEmergenciaId
  );

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

  // Triggers de carga de fotos
  const handleTriggerCamera = () => {
    if (isSubmitting) return;
    cameraInputRef.current?.click();
  };

  const handleTriggerGallery = () => {
    if (isSubmitting) return;
    galleryInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAdjuntarEvidencias(files);
    }
    e.target.value = '';
  };

  return (
    <div className="w-full space-y-3">
      {/* Inputs ocultos de carga multimedia */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={isSubmitting}
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4"
        className="hidden"
        disabled={isSubmitting}
        onChange={handleFileChange}
      />

      {/* Tarjeta Contenedora Principal */}
      <div className="w-full bg-white rounded-2xl border border-stone-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3.5">
        {/* PASO 2: Tipo de Incidente en Grid de 1 Toque (Cuadricula 2x2) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 tracking-tight">
              Tipo de Incidente
            </label>
            <span className="text-[10px] text-stone-400 font-medium">
              1 Toque
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {gridOptions.map((opt) => {
              const optId = resolveOptionId(opt);
              const isSelected = tipoEmergenciaId === optId;
              const IconComp = opt.icon;

              return (
                <button
                  key={opt.title}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onSelectTipoEmergencia(optId)}
                  className={`p-3 rounded-xl flex flex-col items-start justify-center transition-all select-none cursor-pointer text-left ${
                    isSelected
                      ? 'border-2 border-[#143601] bg-emerald-50/70 text-[#143601] shadow-2xs ring-1 ring-[#143601]/20 font-bold'
                      : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 font-medium'
                  }`}
                >
                  <IconComp
                    className={`w-5 h-5 mb-1.5 ${
                      isSelected ? 'text-[#143601] stroke-[2.2]' : 'text-stone-500 stroke-[1.8]'
                    }`}
                  />
                  <span className="text-xs leading-tight tracking-tight">
                    {opt.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Linea discreta con la descripcion del incidente seleccionado */}
          {selectedIncident?.descripcion && (
            <p className="text-[11px] text-stone-600 pt-0.5 leading-tight flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#143601] shrink-0" />
              <span className="truncate">{selectedIncident.descripcion}</span>
            </p>
          )}
        </div>

        {/* PASO 3: Contexto Rapido y Evidencia (Opcional - Patron Doble Velocidad) */}
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 tracking-tight">
              Evidencia y Contexto (Opcional)
            </label>
            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
              Opcional · No detiene el envío SOS
            </span>
          </div>

          {/* Pildoras de Situacion de 1 Toque (Quick-Tags sin teclear) */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all select-none cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-emerald-100/90 border border-emerald-300 text-[#143601] shadow-2xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {isActive ? (
                    <CheckIcon className="w-3.5 h-3.5 text-[#143601] stroke-[2.5]" />
                  ) : (
                    <span className="text-stone-400 font-bold">+</span>
                  )}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>

          {/* Bloque Horizontal Compacto: Foto (col-4) + Textarea (col-8) */}
          <div className="grid grid-cols-12 gap-2.5 items-stretch pt-1">
            {/* Columna Izquierda: Adjuntar Foto */}
            <div className="col-span-4 flex flex-col justify-stretch">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className={`w-full h-full min-h-[76px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 transition-all cursor-pointer select-none group ${
                      evidencias.length > 0
                        ? 'border-[#143601] bg-emerald-50/50 text-[#143601]'
                        : 'border-stone-300 hover:border-[#143601] bg-stone-50/70 hover:bg-stone-100/60 text-stone-600 hover:text-[#143601]'
                    }`}
                  >
                    {evidencias.length > 0 && evidencias[0].tipo === 'image' ? (
                      <div className="relative w-7 h-7 rounded-md overflow-hidden mb-1 border border-[#143601]/40">
                        <img
                          src={evidencias[0].previewUrl}
                          alt="Evidencia"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <CameraIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform stroke-[1.8]" />
                    )}

                    <span className="text-[10px] font-bold text-center leading-tight">
                      {evidencias.length > 0
                        ? `${evidencias.length} ${evidencias.length === 1 ? 'Foto' : 'Fotos'}`
                        : 'Adjuntar Foto'}
                    </span>
                    <span className="text-[9px] text-stone-400 text-center leading-tight">
                      {evidencias.length > 0 ? 'Toca p/ ver' : 'Cámara/Galería'}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  className="w-48 rounded-xl bg-white border border-stone-200 shadow-xl p-1 z-50 animate-fadeIn"
                >
                  <DropdownMenuItem
                    onClick={handleTriggerCamera}
                    className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                  >
                    <CameraIcon className="w-4 h-4 text-[#143601] stroke-[2]" />
                    <span>Tomar foto (Cámara)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleTriggerGallery}
                    className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                  >
                    <EyeIcon className="w-4 h-4 text-[#143601] stroke-[2]" />
                    <span>Subir de la galería</span>
                  </DropdownMenuItem>

                  {evidencias.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="my-1 bg-stone-100" />
                      <DropdownMenuItem
                        onClick={() => setSelectedForView(evidencias[0])}
                        className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                      >
                        <EyeIcon className="w-4 h-4 text-stone-600 stroke-[2]" />
                        <span>Ver foto actual</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onRemoverEvidencia(evidencias[0].id)}
                        className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4 text-rose-600 stroke-[2]" />
                        <span>Quitar foto</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Columna Derecha: Indicaciones Rapidas Textarea */}
            <div className="col-span-8 flex flex-col justify-stretch">
              <textarea
                id="indicaciones-rapidas"
                rows={2}
                disabled={isSubmitting}
                value={manualNotes}
                onChange={handleManualNotesChange}
                placeholder="Calle de referencia, color de vehículo o detalles..."
                className="w-full h-full min-h-[76px] p-2 text-xs text-stone-800 bg-stone-50/60 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#143601]/20 focus:border-[#143601] placeholder:text-stone-400 resize-none transition-colors leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Mensaje de Error */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="font-medium leading-tight">{errorMessage}</p>
        </div>
      )}

      {/* PASO 5: Boton de Accion Critica (SOS Inmediato) */}
      <div className="space-y-1.5 pt-1">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full h-14 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 text-white font-black text-base sm:text-lg tracking-wider uppercase rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer select-none"
        >
          {isSubmitting ? (
            <>
              <ArrowPathIcon className="w-6 h-6 animate-spin text-white" />
              <span>{submittingStep || 'Despachando SOS...'}</span>
            </>
          ) : (
            <>
              <SignalIcon className="w-6 h-6 stroke-[2.4] animate-pulse text-white" />
              <span>ENVIAR ALERTA SOS</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-stone-500 text-center font-medium leading-tight select-none">
          Despacho inmediato con tu ubicación GPS actual
        </p>
      </div>

      {/* Dialog para Visualizar la Foto */}
      {selectedForView && (
        <Dialog open={!!selectedForView} onOpenChange={(open) => !open && setSelectedForView(null)}>
          <DialogContent className="max-w-sm p-4 rounded-2xl bg-white border border-stone-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <CameraIcon className="w-4 h-4 text-[#143601]" />
                <span>Foto de Evidencia</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 font-mono truncate">
                {selectedForView.file.name} · {selectedForView.tamanoFormateado}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center max-h-[60vh]">
              <img
                src={selectedForView.previewUrl}
                alt={selectedForView.file.name}
                className="w-full h-auto max-h-[55vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
