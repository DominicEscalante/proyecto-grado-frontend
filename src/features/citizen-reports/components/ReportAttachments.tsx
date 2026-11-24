import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { apiClient } from '../../../api/client.js';
import { getReportAttachments, type ReportAttachment } from '../api/citizen-reports.api.js';

const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function resolveMediaUrl(path: string) {
  try {
    const url = new URL(path, new URL(apiClient.defaults.baseURL ?? '/', window.location.origin));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function AttachmentPreview({ attachment, ticket, index }: {
  attachment: ReportAttachment;
  ticket: string;
  index: number;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const url = resolveMediaUrl(attachment.urlArchivo);
  const isImage = attachment.tipoArchivo.startsWith('image/');
  const isVideo = attachment.tipoArchivo.startsWith('video/');
  const label = `${isImage ? 'Foto' : isVideo ? 'Video' : 'Archivo'} ${index + 1}`;

  if (!url) return <li className="rounded-md border border-slate-200 p-3 text-sm text-slate-600">{label} · Archivo no disponible</li>;

  async function saveImage(imageUrl: string) {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const extension = imageExtensions[attachment.tipoArchivo];
      const filename = `${ticket}-foto-${index + 1}${extension ? `.${extension}` : ''}`;
      const file = new File([blob], filename, { type: attachment.tipoArchivo });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (shareError) {
          if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
        }
      }

      const localUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = localUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(localUrl), 30_000);
    } catch {
      setError('No se pudo guardar la foto. Ábrela para guardarla desde el navegador.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {isImage && (
        <a href={url} target="_blank" rel="noreferrer" aria-label={`Abrir ${label.toLowerCase()}`} className="block bg-slate-100">
          <img src={url} alt={label} loading="lazy" className="h-36 w-full object-contain" />
        </a>
      )}
      {attachment.tipoArchivo.startsWith('audio/') && <audio controls src={url} preload="metadata" aria-label={label} />}
      {isVideo && <video aria-label={label} src={url} controls playsInline preload="metadata" className="h-36 w-full bg-slate-950 object-contain" />}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2">
        <a href={url} target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-900 underline">{label}</a>
        {isImage && (
          <button type="button" onClick={() => void saveImage(url)} disabled={saving} aria-label={`Guardar ${label.toLowerCase()}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60">
            <Download aria-hidden="true" className="h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar imagen'}
          </button>
        )}
      </div>
      {error && <p role="alert" className="px-2 pb-2 text-xs text-red-800">{error}</p>}
    </li>
  );
}

export function ReportAttachments({ ticket }: { ticket: string }) {
  const [attachments, setAttachments] = useState<ReportAttachment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ticket) return;
    const request = new AbortController();
    getReportAttachments(ticket, request.signal)
      .then((items) => { if (!request.signal.aborted) setAttachments(items); })
      .catch(() => { if (!request.signal.aborted) setFailed(true); });
    return () => request.abort();
  }, [ticket, attempt]);

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">Archivos adjuntos{attachments ? ` (${attachments.length})` : ''}</h3>
      {!ticket ? (
        <p className="text-sm text-slate-600">El reporte aún no tiene un ticket disponible.</p>
      ) : failed ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <p role="alert" className="text-red-800">No se pudieron cargar los archivos adjuntos.</p>
          <button type="button" className="font-semibold text-emerald-900 underline" onClick={() => {
            setFailed(false);
            setAttempt((value) => value + 1);
          }}>Reintentar</button>
        </div>
      ) : attachments === null ? (
        <p role="status" className="text-sm text-slate-600">Cargando archivos adjuntos…</p>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-slate-600">Este reporte no tiene archivos adjuntos.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
          {attachments.map((attachment, index) => (
            <AttachmentPreview key={attachment.adjuntoId} attachment={attachment} index={index} ticket={ticket} />
          ))}
        </ul>
      )}
    </section>
  );
}
