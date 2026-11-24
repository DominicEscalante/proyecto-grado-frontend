import { useEffect, useState } from 'react';
import { apiClient } from '../api/client.js';
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

export function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [audit, setAudit] = useState<AuditPage | null>(null);
  const [auditError, setAuditError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [backupError, setBackupError] = useState(false);

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
    setPage(nextPage);
  }

  async function downloadBackup() {
    setDownloading(true);
    setBackupError(false);
    try {
      const { data } = await apiClient.post<Blob>('/api/admin/respaldos', undefined, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ampar-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setBackupError(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-stone-900">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h1 className="text-xl font-bold text-[#143601]">Bitácora de auditoría</h1>
          {auditError && <p role="alert" className="mt-4 text-red-700">No se pudo consultar la bitácora.</p>}
          {!audit && !auditError && <p role="status" className="mt-4">Cargando registros…</p>}
          {audit?.items.length === 0 && <p className="mt-4">No hay registros en esta página.</p>}
          {!!audit?.items.length && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-stone-100">
                  <tr>
                    {['Fecha y hora', 'Usuario', 'IP', 'Módulo', 'Acción'].map((label) => (
                      <th key={label} scope="col" className="px-3 py-2">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {audit.items.map((entry) => (
                    <tr key={entry.id} className="border-b border-stone-200">
                      <td className="whitespace-nowrap px-3 py-2">{new Date(entry.fecha).toLocaleString('es-BO')}</td>
                      <td className="px-3 py-2">
                        {entry.usuario}
                        <div className="break-all text-xs text-stone-500">{entry.usuarioId}</div>
                      </td>
                      <td className="px-3 py-2">{entry.ip}</td>
                      <td className="px-3 py-2">{entry.modulo}</td>
                      <td className="px-3 py-2">{entry.accion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <nav aria-label="Páginas de la bitácora" className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <button type="button" disabled={page === 1} onClick={() => changePage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Anterior</button>
            <span>Página {page}</span>
            <button type="button" disabled={!audit?.haySiguiente} onClick={() => changePage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Siguiente</button>
          </nav>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-[#143601]">Respaldo de la base de datos</h2>
          <button type="button" onClick={() => void downloadBackup()} disabled={downloading} className="mt-3 rounded-lg bg-[#245501] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {downloading ? 'Generando respaldo…' : 'Descargar respaldo'}
          </button>
          {backupError && <p role="alert" className="mt-3 text-red-700">No se pudo descargar el respaldo. Inténtalo nuevamente.</p>}
        </section>
      </main>
    </div>
  );
}
