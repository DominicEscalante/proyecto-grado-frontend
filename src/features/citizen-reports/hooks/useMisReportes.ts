// Hook para listar los reportes del ciudadano ("Mis Reportes / Alertas")

import { useState, useEffect, useCallback } from 'react';
import { ReporteCiudadanoResumen } from '../types/citizen-reports.types.js';
import { getMisReportesApi } from '../api/citizen-reports.api.js';

export function useMisReportes() {
  const [reportes, setReportes] = useState<ReporteCiudadanoResumen[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarReportes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMisReportesApi(1, 20);
      setReportes(data.reportes || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar historial de reportes.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  return {
    reportes,
    total,
    isLoading,
    error,
    recargarReportes: cargarReportes,
  };
}
