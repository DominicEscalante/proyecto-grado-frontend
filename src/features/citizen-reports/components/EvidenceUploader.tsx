// Componente para adjuntar evidencias multimedia en fila fija horizontal con soporte para multiples fotos, scroll tactil protegido y opciones de Camara/Galeria

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Play,
  Eye,
  Trash2,
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { EvidenciaArchivo } from '../types/citizen-reports.types.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/index.js';

interface EvidenceUploaderProps {
  evidencias: EvidenciaArchivo[];
  onAdjuntar: (files: FileList | null) => void;
  onRemover: (id: string) => void;
  onReemplazar?: (targetId: string, files: FileList | null) => void;
  disabled?: boolean;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  evidencias,
  onAdjuntar,
  onRemover,
  onReemplazar,
  disabled = false,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedForView, setSelectedForView] = useState<EvidenciaArchivo | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Estados para flechas y visibilidad del scroll
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Rastreo de puntero / touch para discriminar entre tap intencional y desplazamiento (scroll / swipe)
  const pointerStateRef = useRef<{
    isPointerDown: boolean;
    pointerType: string;
    startX: number;
    startY: number;
    initialScrollLeft: number;
    hasMoved: boolean;
  }>({
    isPointerDown: false,
    pointerType: 'mouse',
    startX: 0,
    startY: 0,
    initialScrollLeft: 0,
    hasMoved: false,
  });

  // Bandera de seguridad para bloquear aperturas de menu justo despues de un gesto de scroll
  const justScrolledRef = useRef(false);

  // Rastreo de si la accion actual es agregar nueva foto o reemplazar una existente
  const activeActionRef = useRef<{ mode: 'add' | 'replace'; targetId?: string }>({
    mode: 'add',
  });

  const totalEvidencias = evidencias.length;
  const puedeAgregarMas = totalEvidencias < 5;

  // Verificar si hay overflow y actualizar estado de botones de navegacion
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  // Escuchar eventos de resize y montado
  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScroll]);

  // Si se anade una nueva evidencia, hacer scroll automatico al final para verla inmediatamente
  const prevCountRef = useRef(evidencias.length);
  useEffect(() => {
    if (evidencias.length > prevCountRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth',
          });
          checkScroll();
        }
      }, 80);
    } else {
      checkScroll();
    }
    prevCountRef.current = evidencias.length;
  }, [evidencias.length, checkScroll]);

  // Desplazar manualmente mediante los botones chevron
  const handleScrollBy = (amount: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 200);
  };

  // Manejadores de puntero en el contenedor para scroll por arrastre (desktop + touch)
  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStateRef.current = {
      isPointerDown: true,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      initialScrollLeft: scrollContainerRef.current?.scrollLeft || 0,
      hasMoved: false,
    };
  };

  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStateRef.current.isPointerDown) return;

    const dx = e.clientX - pointerStateRef.current.startX;
    const dy = e.clientY - pointerStateRef.current.startY;

    // Si se desplaza mas de 5px, se considera gesto de scroll/swipe
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      pointerStateRef.current.hasMoved = true;
    }

    // Scroll con arrastre de raton en escritorio
    if (
      pointerStateRef.current.pointerType === 'mouse' &&
      pointerStateRef.current.hasMoved &&
      scrollContainerRef.current
    ) {
      scrollContainerRef.current.scrollLeft =
        pointerStateRef.current.initialScrollLeft - dx;
      checkScroll();
    }
  };

  const handleContainerPointerUp = () => {
    if (pointerStateRef.current.hasMoved) {
      justScrolledRef.current = true;
      setTimeout(() => {
        justScrolledRef.current = false;
      }, 220);
    }
    pointerStateRef.current.isPointerDown = false;
    checkScroll();
  };

  // Disparar captura con camara trasera
  const handleTriggerCamera = (mode: 'add' | 'replace', targetId?: string) => {
    if (disabled) return;
    setOpenMenuId(null);
    activeActionRef.current = { mode, targetId };
    cameraInputRef.current?.click();
  };

  // Disparar explorador de galeria/archivos
  const handleTriggerGallery = (mode: 'add' | 'replace', targetId?: string) => {
    if (disabled) return;
    setOpenMenuId(null);
    activeActionRef.current = { mode, targetId };
    galleryInputRef.current?.click();
  };

  // Manejador centralizado de los inputs ocultos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { mode, targetId } = activeActionRef.current;

    if (mode === 'replace' && targetId) {
      if (onReemplazar) {
        onReemplazar(targetId, files);
      } else {
        onRemover(targetId);
        onAdjuntar(files);
      }
    } else {
      onAdjuntar(files);
    }

    e.target.value = '';
    activeActionRef.current = { mode: 'add' };
  };

  return (
    <div className="w-full space-y-1.5 overflow-hidden">
      {/* Encabezado con contador, aviso de deslizamiento y flechas de navegacion */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-xs font-bold text-stone-800 tracking-tight shrink-0">
            Evidence
          </label>
          {totalEvidencias >= 4 && (
            <span className="text-[10px] text-stone-400 font-normal truncate hidden sm:inline">
              (Desliza para ver todas)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botones chevron para desplazamiento cuando el contenido desborda */}
          {(canScrollLeft || canScrollRight) && (
            <div className="flex items-center gap-0.5 bg-stone-100/90 rounded-lg p-0.5 border border-stone-200">
              <button
                type="button"
                disabled={!canScrollLeft}
                onClick={() => handleScrollBy(-110)}
                className="p-0.5 rounded text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Ver anteriores"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                disabled={!canScrollRight}
                onClick={() => handleScrollBy(110)}
                className="p-0.5 rounded text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Ver siguientes"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Badge con total de archivos */}
          {totalEvidencias > 0 && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 font-mono">
              {totalEvidencias} de 5 {totalEvidencias === 1 ? 'archivo' : 'archivos'}
            </span>
          )}
        </div>
      </div>

      {/* Input oculto para Captura con Camara (capture="environment") */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />

      {/* Input oculto para Seleccion desde Galeria */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />

      {/* Contenedor relativo con fila horizontal scrollable y proteccion tactil */}
      <div className="relative w-full">
        {/* Sombra de desborde izquierda */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-1.5 w-5 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        )}

        {/* Fila horizontal fija (80px de alto con scrollbar fino para ver todas las fotos) */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onPointerDown={handleContainerPointerDown}
          onPointerMove={handleContainerPointerMove}
          onPointerUp={handleContainerPointerUp}
          onPointerCancel={handleContainerPointerUp}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 transparent',
            WebkitOverflowScrolling: 'touch',
          }}
          className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth touch-pan-x select-none cursor-default"
        >
          {/* Caso A: Ningun archivo cargado -> Boton inicial grande de 80x80px */}
          {totalEvidencias === 0 && (
            <DropdownMenu
              open={openMenuId === 'add-initial'}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                  setOpenMenuId(null);
                } else if (!pointerStateRef.current.hasMoved && !justScrolledRef.current) {
                  setOpenMenuId('add-initial');
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  onPointerDown={(e) => {
                    if (e.pointerType === 'mouse') e.preventDefault();
                  }}
                  onClick={(e) => {
                    if (pointerStateRef.current.hasMoved || justScrolledRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setOpenMenuId((curr) => (curr === 'add-initial' ? null : 'add-initial'));
                  }}
                  style={{
                    width: '80px',
                    height: '80px',
                    minWidth: '80px',
                    minHeight: '80px',
                    maxWidth: '80px',
                    maxHeight: '80px',
                  }}
                  className="w-20 h-20 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-stone-200 flex flex-col items-center justify-center p-1 text-stone-700 transition-colors select-none shadow-2xs group cursor-pointer active:scale-95 shrink-0 overflow-hidden"
                >
                  <Camera className="w-5 h-5 text-stone-600 mb-1 group-hover:scale-110 transition-transform stroke-[1.8]" />
                  <span className="text-[10px] font-bold text-center leading-tight">
                    Adjuntar Archivos
                  </span>
                  <span className="text-[9px] text-stone-500 text-center leading-tight">
                    (Opcional)
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-52 rounded-xl bg-white border border-stone-200 shadow-xl p-1 z-50 animate-fadeIn"
              >
                <DropdownMenuLabel className="text-[10px] font-bold text-stone-500 uppercase px-2 py-1">
                  Adjuntar Evidencia
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => handleTriggerCamera('add')}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#143601] shrink-0 stroke-[2]" />
                  <span>Tomar foto (Cámara)</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleTriggerGallery('add')}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#143601] shrink-0 stroke-[2]" />
                  <span>Subir de la galería</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Caso B: Archivos cargados -> Cada foto en su cuadrado exacto de 80x80px */}
          {evidencias.map((item, index) => (
            <DropdownMenu
              key={item.id}
              open={openMenuId === item.id}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                  setOpenMenuId(null);
                } else if (!pointerStateRef.current.hasMoved && !justScrolledRef.current) {
                  setOpenMenuId(item.id);
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  onPointerDown={(e) => {
                    if (e.pointerType === 'mouse') e.preventDefault();
                  }}
                  onClick={(e) => {
                    if (pointerStateRef.current.hasMoved || justScrolledRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setOpenMenuId((curr) => (curr === item.id ? null : item.id));
                  }}
                  style={{
                    width: '80px',
                    height: '80px',
                    minWidth: '80px',
                    minHeight: '80px',
                    maxWidth: '80px',
                    maxHeight: '80px',
                  }}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#143601]/40 hover:border-[#143601] bg-stone-900 shadow-2xs group cursor-pointer transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#143601]/30 shrink-0 select-none block"
                  title={`Foto ${index + 1} - Toca para opciones`}
                >
                  {item.tipo === 'image' ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      className="w-full h-full object-cover block pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-white p-1">
                      <Play className="w-5 h-5 text-amber-400 mb-0.5" />
                      <span className="text-[8px] font-mono text-center">Video</span>
                    </div>
                  )}

                  {/* Overlay sutil al hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <MoreVertical className="w-4 h-4 text-white drop-shadow" />
                  </div>

                  {/* Badge con tamano */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-2xs py-0.5 px-1 text-center">
                    <span className="text-[8px] font-mono text-white/95 truncate block leading-none">
                      {item.tamanoFormateado}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>

              {/* Submenu contextual individual para esta foto */}
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-52 rounded-xl bg-white border border-stone-200 shadow-xl p-1 z-50 animate-fadeIn"
              >
                <DropdownMenuLabel className="text-[10px] font-bold text-stone-500 uppercase px-2 py-1">
                  Foto {index + 1} de {totalEvidencias}
                </DropdownMenuLabel>

                {/* 1. Visualizar */}
                <DropdownMenuItem
                  onClick={() => {
                    setOpenMenuId(null);
                    setSelectedForView(item);
                  }}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>Visualizar imagen</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-stone-100" />

                {/* 2. Tomar otra foto con la camara (si hay cupo disponible) */}
                {puedeAgregarMas && (
                  <DropdownMenuItem
                    onClick={() => handleTriggerCamera('add')}
                    className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#143601] shrink-0" />
                    <span>Tomar otra foto (Cámara)</span>
                  </DropdownMenuItem>
                )}

                {/* 3. Agregar otra de la galeria (si hay cupo disponible) */}
                {puedeAgregarMas && (
                  <DropdownMenuItem
                    onClick={() => handleTriggerGallery('add')}
                    className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-[#143601] shrink-0" />
                    <span>Agregar de la galería</span>
                  </DropdownMenuItem>
                )}

                {puedeAgregarMas && <DropdownMenuSeparator className="my-1 bg-stone-100" />}

                {/* 4. Reemplazar esta foto con la camara */}
                <DropdownMenuItem
                  onClick={() => handleTriggerCamera('replace', item.id)}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>Reemplazar con cámara</span>
                </DropdownMenuItem>

                {/* 5. Reemplazar esta foto desde la galeria */}
                <DropdownMenuItem
                  onClick={() => handleTriggerGallery('replace', item.id)}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>Reemplazar desde galería</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-stone-100" />

                {/* 6. Eliminar esta foto */}
                <DropdownMenuItem
                  onClick={() => {
                    setOpenMenuId(null);
                    onRemover(item.id);
                  }}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Eliminar esta foto</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {/* Boton adicional "+" para tomar/agregar otra foto si ya hay fotos cargadas y quedan cupos */}
          {totalEvidencias > 0 && puedeAgregarMas && (
            <DropdownMenu
              open={openMenuId === 'add-more'}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                  setOpenMenuId(null);
                } else if (!pointerStateRef.current.hasMoved && !justScrolledRef.current) {
                  setOpenMenuId('add-more');
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  onPointerDown={(e) => {
                    if (e.pointerType === 'mouse') e.preventDefault();
                  }}
                  onClick={(e) => {
                    if (pointerStateRef.current.hasMoved || justScrolledRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setOpenMenuId((curr) => (curr === 'add-more' ? null : 'add-more'));
                  }}
                  style={{
                    width: '80px',
                    height: '80px',
                    minWidth: '80px',
                    minHeight: '80px',
                    maxWidth: '80px',
                    maxHeight: '80px',
                  }}
                  className="w-20 h-20 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border-2 border-dashed border-stone-300 flex flex-col items-center justify-center p-1 text-stone-600 transition-colors select-none shadow-2xs group cursor-pointer active:scale-95 shrink-0 overflow-hidden"
                  title="Tomar o agregar otra foto"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-200 group-hover:bg-[#143601] group-hover:text-white flex items-center justify-center mb-1 transition-colors text-stone-600">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">
                    Tomar otra
                  </span>
                  <span className="text-[9px] text-stone-400 text-center leading-tight">
                    ({totalEvidencias}/5)
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-52 rounded-xl bg-white border border-stone-200 shadow-xl p-1 z-50 animate-fadeIn"
              >
                <DropdownMenuLabel className="text-[10px] font-bold text-stone-500 uppercase px-2 py-1">
                  Agregar Otra Evidencia
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => handleTriggerCamera('add')}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#143601] shrink-0 stroke-[2]" />
                  <span>Tomar foto (Cámara)</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleTriggerGallery('add')}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#143601] shrink-0 stroke-[2]" />
                  <span>Subir de la galería</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Sombra de desborde derecha */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-1.5 w-5 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
        )}
      </div>

      {/* Modal / Dialog de Shadcn para Visualizar la foto completa */}
      {selectedForView && (
        <Dialog open={!!selectedForView} onOpenChange={(open) => !open && setSelectedForView(null)}>
          <DialogContent className="max-w-sm sm:max-w-md p-4 rounded-2xl bg-white border border-stone-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#143601]" />
                <span>Evidencia Adjunta</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 font-mono truncate">
                {selectedForView.file.name} · {selectedForView.tamanoFormateado}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center max-h-[65vh]">
              {selectedForView.tipo === 'image' ? (
                <img
                  src={selectedForView.previewUrl}
                  alt={selectedForView.file.name}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              ) : (
                <video
                  src={selectedForView.previewUrl}
                  controls
                  className="w-full max-h-[60vh]"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
