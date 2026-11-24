import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog.js';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { enrollPasskey, confirmBackupPasskey } from '../features/auth/api/passkey.api.js';
import { apiClient } from '../api/client.js';
import { Input } from '../components/ui/Input.js';
import { AppHeader } from '../components/layout/index.js';

interface AuditEntry {
  id: number;
  fecha: string;
  usuario: string;
  usuarioId: string;
  ip: string;
  accion: string;
  modulo: string;
}

interface AuditPage {
  items: AuditEntry[];
  haySiguiente: boolean;
}

const dateFormat = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/La_Paz',
});
const timeFormat = new Intl.DateTimeFormat('es-BO', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'America/La_Paz',
});
const labels: Record<string, string> = {
  AUTH: 'Autenticación', CIUDADANO: 'Ciudadanía', OPERADOR: 'Operaciones', ADMIN: 'Administración',
  INICIO_SESION: 'Inicio de sesión', REPORTE_CREADO: 'Creación de reporte', CAMBIO_ESTADO_REPORTE: 'Cambio de estado de reporte',
};
function displayCode(value: string) {
  return labels[value] ?? value.replace(/_/g, ' ').toLocaleLowerCase('es');
}

export function AdminAuditPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [audit, setAudit] = useState<AuditPage | null>(null);
  const [auditError, setAuditError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [backupError, setBackupError] = useState('');
  const [needsPasskey, setNeedsPasskey] = useState(false);
  const [confirmBackup, setConfirmBackup] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiClient.get<{ data: AuditPage }>('/api/admin/auditoria', {
      params: { pagina: page },
      signal: controller.signal,
    }).then(({ data }) => {
      if (!controller.signal.aborted) setAudit(data.data);
    }).catch(() => {
      if (!controller.signal.aborted) setAuditError(true);
    });
    return () => controller.abort();
  }, [page]);

  function changePage(nextPage: number) {
    setAudit(null);
    setAuditError(false);
    setQuery('');
    setPage(nextPage);
  }

  async function openBackup() {
    setDownloading(true);
    setBackupError('');
    try {
      const { data } = await apiClient.get<{ data: { enrolled: boolean } }>('/api/admin/respaldos/passkey');
      setNeedsPasskey(!data.data.enrolled);
      setConfirmBackup(true);
    } catch {
      setBackupError('No se pudo consultar el estado de tu clave de acceso.');
    } finally {
      setDownloading(false);
    }
  }

  async function downloadBackup(password: string) {
    setDownloading(true);
    setBackupError('');
    try {
      if (needsPasskey) {
        await enrollPasskey(password);
        setNeedsPasskey(false);
        return;
      }
      const proof = await confirmBackupPasskey();
      const { data } = await apiClient.post<Blob>('/api/admin/respaldos', { proof }, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ampar-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`;
      link.click();
      setConfirmBackup(false);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
     } catch (error) {
      setBackupError(isAxiosError(error) && error.response?.status === 403
        ? 'La confirmación venció o pertenece a otra cuenta.' :
        needsPasskey ? 'No se pudo configurar la passkey. Revisa tu contraseña e inténtalo de nuevo.' : 'No se pudo confirmar o generar el respaldo.');
    } finally {
      setDownloading(false);
    }
  }

  const term = query.trim().toLocaleLowerCase('es');
  const entries = audit?.items.filter(entry =>
    [entry.usuario, entry.usuarioId, entry.ip, entry.accion, entry.modulo, displayCode(entry.accion), displayCode(entry.modulo)]
      .some(value => value?.toLocaleLowerCase('es').includes(term))
  ) ?? [];
  const pagerButton = 'inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1.5 font-medium hover:bg-stone-100 disabled:opacity-40';

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f5f6f4] text-stone-900">
      <AppHeader className="shrink-0" />
      <main className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col px-4 py-6 sm:px-8 lg:px-12 lg:py-9">
        <header className="mb-5 flex shrink-0 flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bitácora de auditoría</h1>
          <button type="button" disabled={downloading} onClick={() => void openBackup()}
            className="inline-flex items-center gap-2 rounded-md bg-[#234823] px-4 py-2 text-sm font-medium text-white hover:bg-[#183718] disabled:opacity-60">
            <Download size={16} aria-hidden="true" />{downloading ? 'Generando respaldo…' : 'Descargar respaldo'}
          </button>
        </header>
        {!confirmBackup && backupError && <p role="alert" className="mb-3 text-sm text-red-700">{backupError}</p>}
        <Dialog open={confirmBackup} onOpenChange={open => { if (!downloading) setConfirmBackup(open); }}>
          <DialogContent className="text-stone-900">
            <DialogTitle>Autorizar respaldo</DialogTitle>
            <DialogDescription>{needsPasskey ? 'Configura una passkey para autorizar la descarga. Introduce tu contraseña de AMPAR para registrarla.' : 'Confirma con tu passkey para descargar una copia completa de la base de datos.'}</DialogDescription>
            <form className="grid gap-3" onSubmit={event => {
              event.preventDefault();
              const form = event.currentTarget;
              const key = String(new FormData(form).get('password') ?? '');
              form.reset();
              void downloadBackup(key);
            }}>
              {needsPasskey && (
                <Input id="backup-enrollment-password" name="password" type="password"
                  label="Contraseña de AMPAR" autoComplete="current-password" autoFocus required />
              )}
              {backupError && <p role="alert" className="text-sm text-red-700">{backupError}</p>}
              <button disabled={downloading} className="rounded bg-[#234823] p-2 text-sm font-semibold text-white disabled:opacity-60">
                {downloading ? 'Procesando…' : needsPasskey ? 'Configurar passkey' : 'Confirmar con passkey'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
        <section aria-label="Registro de actividad" className="flex min-h-0 flex-col overflow-hidden rounded-md border border-stone-300 bg-white">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold">Registro de actividad</h2>
            <label className="flex w-full items-center gap-2 rounded border border-stone-300 px-3 text-stone-500 focus-within:border-green-800 sm:w-64">
              <Search size={15} aria-hidden="true" />
              <input type="search" aria-label="Buscar en esta página" placeholder="Buscar en esta página" value={query}
                onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-sm text-stone-900 outline-none" />
            </label>
          </div>
          <div className="min-h-0 overflow-auto">
            <table className="w-full min-w-[840px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#eef1ed] text-xs font-semibold text-stone-600">
                <tr>{['Fecha y hora', 'Acción', 'Usuario', 'Módulo', 'IP de origen'].map(label =>
                  <th key={label} scope="col" className="px-5 py-3">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-[#f7f9f6]">
                    <td className="whitespace-nowrap px-5 py-2.5 tabular-nums">
                      {dateFormat.format(new Date(entry.fecha))}
                      <span className="block text-xs text-stone-500">{timeFormat.format(new Date(entry.fecha))}</span>
                    </td>
                    <td className="px-5 py-2.5 font-medium first-letter:uppercase" title={entry.accion}>{displayCode(entry.accion)}</td>
                    <td className="px-5 py-2.5">{entry.usuario}<span className="block font-mono text-[11px] text-stone-500">{entry.usuarioId}</span></td>
                    <td className="px-5 py-2.5 text-stone-600 first-letter:uppercase" title={entry.modulo}>{displayCode(entry.modulo)}</td>
                    <td className="px-5 py-2.5 font-mono text-xs">{entry.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!entries.length && <p role={auditError ? 'alert' : 'status'} className="min-h-0 overflow-auto px-5 py-6 text-center text-sm text-stone-600">
            {auditError ? 'No se pudo consultar la bitácora.' : !audit ? 'Cargando registros…' : term ? 'Sin coincidencias en esta página.' : 'No hay registros en esta página.'}
          </p>}
          <nav aria-label="Páginas de la bitácora" className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-5 py-3 text-xs">
            <span className="text-stone-600">Página {page}{audit && ` · ${entries.length} registros visibles`}</span>
            <div className="flex gap-2">
              <button type="button" className={pagerButton} disabled={page === 1} onClick={() => changePage(page - 1)}><ChevronLeft size={14} />Anterior</button>
              <button type="button" className={pagerButton} disabled={!audit?.haySiguiente} onClick={() => changePage(page + 1)}>Siguiente<ChevronRight size={14} /></button>
            </div>
          </nav>
        </section>
      </main>
    </div>
  );
}
