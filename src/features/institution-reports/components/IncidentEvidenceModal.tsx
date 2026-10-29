import React from 'react';
import { ArrowTopRightOnSquareIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AdjuntoMedia } from '../types/institution-reports.types.js';

interface Props { adjunto: AdjuntoMedia | null; onClose: () => void; }

export const IncidentEvidenceModal: React.FC<Props> = ({ adjunto, onClose }) => {
  if (!adjunto) return null;
  return <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
    <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3"><div className="flex items-center gap-2 text-sm font-semibold text-stone-800"><CameraIcon className="h-4 w-4 text-[#143601]" />{adjunto.nombre || 'Evidencia adjunta'}<span className="text-xs font-normal text-stone-500">{adjunto.formato}</span></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"><XMarkIcon className="h-5 w-5" /></button></div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-stone-50 p-4">{adjunto.tipo === 'video' ? <video src={adjunto.url} controls autoPlay playsInline className="max-h-[70vh] max-w-full rounded-lg" aria-label={adjunto.nombre || 'Video de evidencia'} /> : <img src={adjunto.url} alt={adjunto.nombre || 'Evidencia del reporte'} className="max-h-[70vh] max-w-full rounded-lg object-contain" />}</div>
      <div className="flex justify-end border-t border-stone-200 px-5 py-3"><a href={adjunto.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#143601] hover:underline">Abrir original<ArrowTopRightOnSquareIcon className="h-4 w-4" /></a></div>
    </div>
  </div>;
};
