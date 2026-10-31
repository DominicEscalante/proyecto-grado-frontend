import { useCallback, useEffect, useState } from 'react';
import { getInstitutionalHistoryApi, HistorialIncidentes } from '../api/institution-reports.api.js';

export function useOperatorHistory() {
  const [pagina, setPagina] = useState(1);
  const [orden, setOrden] = useState<'recientes' | 'antiguos'>('recientes');
  const [data, setData] = useState<HistorialIncidentes | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getInstitutionalHistoryApi(pagina, orden, controller.signal).then((result) => {
      setData(result);
      setSelectedId((current) => result.items.some((item) => item.id === current) ? current : result.items[0]?.id ?? null);
      setError(null);
    }).catch((err) => {
      if (err?.name !== 'CanceledError' && err?.name !== 'AbortError') setError('No se pudo cargar el historial.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [pagina, orden, revision]);

  const changeOrder = useCallback((value: 'recientes' | 'antiguos') => { setOrden(value); setPagina(1); }, []);
  return { data, pagina, setPagina, orden, changeOrder, selectedId, setSelectedId, loading, error, reload: () => setRevision((value) => value + 1) };
}
