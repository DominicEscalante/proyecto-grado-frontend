import React, { useRef, useState } from 'react';
import { Camera, Eye, ImagePlus, MoreVertical, Play, RefreshCw, Trash2 } from 'lucide-react';
import type { EvidenciaArchivo } from '../types/citizen-reports.types.js';
import { MAX_EVIDENCE_FILES } from '../utils/report-formatters.js';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../../components/ui/index.js';

const acceptedFiles = 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.mov';

interface EvidenceUploaderProps {
  evidencias: EvidenciaArchivo[];
  onAdjuntar: (files: FileList | null) => void;
  onRemover: (id: string) => void;
  onReemplazar?: (targetId: string, files: FileList | null) => void;
  disabled?: boolean;
}

export const EvidenceUploader = ({
  evidencias, onAdjuntar, onRemover, onReemplazar, disabled = false,
}: EvidenceUploaderProps) => {
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const replacement = useRef<HTMLInputElement>(null);
  const replacementId = useRef<string>();
  const [previewId, setPreviewId] = useState<string>();
  const preview = evidencias.find((item) => item.id === previewId);
  const canAdd = evidencias.length < MAX_EVIDENCE_FILES;

  const handleAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && event.currentTarget.files?.length) onAdjuntar(event.currentTarget.files);
    event.currentTarget.value = '';
  };

  return (
    <div role="group" aria-label="Fotos y videos" className="min-w-0 space-y-1">
      <div className="flex min-h-5 items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-800">Fotos y videos</span>
        <span role="status" aria-label="Archivos adjuntos" className="tabular-nums text-slate-600">
          {evidencias.length}/{MAX_EVIDENCE_FILES}
        </span>
      </div>
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden disabled={disabled} onChange={handleAdd} />
      <input ref={gallery} type="file" accept={acceptedFiles} multiple hidden disabled={disabled} onChange={handleAdd} />
      <input
        ref={replacement}
        type="file"
        accept={acceptedFiles}
        hidden
        disabled={disabled}
        onChange={(event) => {
          if (!disabled && replacementId.current && event.currentTarget.files?.length) {
            onReemplazar?.(replacementId.current, event.currentTarget.files);
          }
          event.currentTarget.value = '';
          replacementId.current = undefined;
        }}
      />

      <div className="grid grid-cols-5 gap-1.5">
        {evidencias.map((item) => (
          <DropdownMenu key={item.id}>
            <DropdownMenuTrigger asChild>
              <button type="button" disabled={disabled} aria-label={`Opciones de ${item.file.name}`} className="relative flex h-11 min-w-0 items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-slate-100 text-slate-700 hover:border-emerald-800 md:h-16">
                {item.tipo === 'image' ? (
                  <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Play aria-hidden="true" className="h-4 w-4" />
                )}
                <MoreVertical aria-hidden="true" className="absolute right-0.5 top-0.5 h-4 w-4 rounded bg-slate-950/75 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 rounded-lg">
              <DropdownMenuItem onSelect={() => setPreviewId(item.id)}><Eye className="mr-2 h-4 w-4" />Ver archivo</DropdownMenuItem>
              {onReemplazar && (
                <DropdownMenuItem onSelect={() => {
                  replacementId.current = item.id;
                  replacement.current?.click();
                }}><RefreshCw className="mr-2 h-4 w-4" />Reemplazar</DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-700" onSelect={() => onRemover(item.id)}><Trash2 className="mr-2 h-4 w-4" />Quitar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

        {canAdd && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" disabled={disabled} className={`flex h-11 min-w-0 items-center justify-center gap-2 rounded-md border border-dashed border-slate-400 bg-slate-50 px-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 md:h-16 ${evidencias.length === 0 ? 'col-span-5' : ''}`}>
                <ImagePlus aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className={evidencias.length ? 'sr-only' : undefined}>Agregar fotos</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-lg">
              <DropdownMenuItem onSelect={() => camera.current?.click()}><Camera className="mr-2 h-4 w-4" />Tomar foto</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => gallery.current?.click()}><ImagePlus className="mr-2 h-4 w-4" />Elegir de la galería</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {preview && (
        <Dialog open onOpenChange={(open) => { if (!open) setPreviewId(undefined); }}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle>Archivo adjunto</DialogTitle>
              <DialogDescription className="break-all">{preview.file.name} · {preview.tamanoFormateado}</DialogDescription>
            </DialogHeader>
            {preview.tipo === 'image' ? (
              <img src={preview.previewUrl} alt={preview.file.name} className="max-h-[60dvh] w-full object-contain" />
            ) : (
              <video src={preview.previewUrl} controls className="max-h-[60dvh] w-full" />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
