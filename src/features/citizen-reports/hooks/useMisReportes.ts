// Hook para listar los reportes del ciudadano ("Mis Reportes / Alertas") con soporte de cache local y sincronizacion en tiempo real

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

      // Combinar reportes del servidor con locales no presentes en el servidor
      const ticketsServidor = new Set(data.reportes.map((r) => r.codigoTicket));
      const localesNoSincronizados = locales.filter((l) => !ticketsServidor.has(l.codigoTicket));
      const combinados = [...localesNoSincronizados, ...data.reportes];

      setReportes(combinados);
      setTotal(Math.max(data.total, combinados.length));

      // Actualizar cache local
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combinados));
      } catch {
        // Ignorar limite de localStorage
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar historial de reportes.';
      setError(msg);
      // Fallback a los reportes locales guardados
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

    // Escuchar el evento de nuevo reporte para actualizar inmediatamente sin recargar la pagina
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
