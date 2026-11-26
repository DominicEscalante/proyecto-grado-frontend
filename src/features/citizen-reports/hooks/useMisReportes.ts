
import { useState, useEffect, useCallback } from 'react';
import { ReporteCiudadanoResumen } from '../types/citizen-reports.types.js';
import { getMisReportesApi } from '../api/citizen-reports.api.js';

const STORAGE_KEY = 'ampar_mis_reportes';

function obtenerReportesLocales(): ReporteCiudadanoResumen[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useMisReportes() {
  const [reportes, setReportes] = useState<ReporteCiudadanoResumen[]>(() => obtenerReportesLocales());
  const [total, setTotal] = useState<number>(() => obtenerReportesLocales().length);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarReportes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMisReportesApi(1, 20);
      const locales = obtenerReportesLocales();

      const ticketsServidor = new Set(data.reportes.map((r) => r.codigoTicket));
      const localesNoSincronizados = locales.filter((l) => !ticketsServidor.has(l.codigoTicket));
      const combinados = [...localesNoSincronizados, ...data.reportes];

      setReportes(combinados);
      setTotal(Math.max(data.total, combinados.length));

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combinados));
      } catch {
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar historial de reportes.';
      setError(msg);
      const locales = obtenerReportesLocales();
      if (locales.length > 0) {
        setReportes(locales);
        setTotal(locales.length);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarReportes();

    const handleNuevoReporte = () => {
      const locales = obtenerReportesLocales();
      if (locales.length > 0) {
        setReportes(locales);
        setTotal(locales.length);
      }
      cargarReportes();
    };

    window.addEventListener('ampar_reporte_creado', handleNuevoReporte);
    return () => {
      window.removeEventListener('ampar_reporte_creado', handleNuevoReporte);
    };
  }, [cargarReportes]);

  return {
    reportes,
    total,
    isLoading,
    error,
    recargarReportes: cargarReportes,
  };
}
