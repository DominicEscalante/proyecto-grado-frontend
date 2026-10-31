// Hook de logica de negocio y estado para el formulario de reporte de emergencias (Feature-First)

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  InstitucionDestino,
  TipoEmergenciaItem,
  EvidenciaArchivo,
  ReporteCreadoResult,
  ReporteCiudadanoResumen,
  CoincidenciaReporte,
} from '../types/citizen-reports.types.js';
import {
  getCatalogoEmergenciasApi,
  crearReporteApi,
  buscarCoincidenciaApi,
  adjuntarEvidenciasApi,
} from '../api/citizen-reports.api.js';
import {
  CATALOGO_EMERGENCIAS_DEFAULT,
  filtrarIncidentesPorInstitucion,
  formatBytes,
} from '../utils/report-formatters.js';
import { useGpsLocation } from './useGpsLocation.js';
import { optimizeEvidence } from '../utils/optimize-evidence.js';

export function useCitizenReportForm() {
  const gps = useGpsLocation();

  // Estado del formulario
  const [institucion, setInstitucion] = useState<InstitucionDestino>('BOMBEROS');
  const [catalogoTotal, setCatalogoTotal] = useState<TipoEmergenciaItem[]>(CATALOGO_EMERGENCIAS_DEFAULT);
  const [tipoEmergenciaId, setTipoEmergenciaId] = useState<number>(4); // Default: Incendio Estructural
  const [indicacionesRapidas, setIndicacionesRapidas] = useState<string>('');
  const [evidencias, setEvidencias] = useState<EvidenciaArchivo[]>([]);

  // Estados de proceso y feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<ReporteCreadoResult | null>(null);
  const [coincidencia, setCoincidencia] = useState<CoincidenciaReporte | null>(null);
  const [avisoCoincidencia, setAvisoCoincidencia] = useState<string | null>(null);
  const [evidenceUpload, setEvidenceUpload] = useState<'idle' | 'uploading' | 'complete' | 'failed'>('idle');
  const [retryUpload, setRetryUpload] = useState<{ ticket: string; files: File[] } | null>(null);

  const uploadInBackground = async (ticket: string, files: File[]) => {
    setEvidenceUpload('uploading');
    try {
      await adjuntarEvidenciasApi(ticket, await Promise.all(files.map(optimizeEvidence)));
      setEvidenceUpload('complete');
      setRetryUpload(null);
    } catch {
      setEvidenceUpload('failed');
      setRetryUpload({ ticket, files });
    }
  };

  // Tipos filtrados por la institucion activa
  const incidentesFiltrados = useMemo(() => {
    return filtrarIncidentesPorInstitucion(catalogoTotal, institucion);
  }, [catalogoTotal, institucion]);

  // Sincronizar catalogo desde la API al montar
  useEffect(() => {
    let isMounted = true;
    getCatalogoEmergenciasApi()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCatalogoTotal(data);
          // Si el tipo actual no pertenece a la institucion actual, asignar el primero valido
          const filtrados = filtrarIncidentesPorInstitucion(data, institucion);
          if (filtrados.length > 0) {
            const existe = filtrados.some((i) => (i.tipoEmergenciaId || i.id) === tipoEmergenciaId);
            if (!existe) {
              setTipoEmergenciaId(filtrados[0].tipoEmergenciaId || filtrados[0].id);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Error cargando catalogo de emergencias:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Al cambiar institucion, seleccionar por defecto el primer incidente de esa lista
  const cambiarInstitucion = useCallback(
    (nuevaInst: InstitucionDestino) => {
      setInstitucion(nuevaInst);
      setErrorMessage(null);
      const filtrados = filtrarIncidentesPorInstitucion(catalogoTotal, nuevaInst);
      if (filtrados.length > 0) {
        const nuevoId = Number(filtrados[0].tipoEmergenciaId || filtrados[0].id);
        setTipoEmergenciaId(nuevoId);
      }
    },
    [catalogoTotal]
  );

  // Adjuntar archivos de evidencia multimedia (Maximo 5 archivos, max 10MB c/u)
  const handleAdjuntarArchivos = useCallback(
    (files: FileList | File[] | null) => {
      if (!files) return;
      const fileArray = Array.from(files);
      setErrorMessage(null);

      const maxPermitidos = 5 - evidencias.length;
      if (maxPermitidos <= 0) {
        setErrorMessage('Ha alcanzado el límite máximo de 5 archivos multimedia por reporte.');
        return;
      }

      const archivosAProcesar = fileArray.slice(0, maxPermitidos);
      const nuevasEvidencias: EvidenciaArchivo[] = [];

      for (const file of archivosAProcesar) {
        // Validar tamano (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setErrorMessage(`El archivo "${file.name}" supera el tamaño máximo permitido de 10 MB.`);
          continue;
        }

        // Validar tipo
        const esImagen = file.type.startsWith('image/');
        const esVideo = file.type.startsWith('video/');
        if (!esImagen && !esVideo) {
          setErrorMessage(`El archivo "${file.name}" no es una imagen o video válido.`);
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        nuevasEvidencias.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl,
          tipo: esVideo ? 'video' : 'image',
          tamanoFormateado: formatBytes(file.size),
        });
      }

      if (nuevasEvidencias.length > 0) {
        setEvidencias((prev) => [...prev, ...nuevasEvidencias]);
      }
    },
    [evidencias]
  );

  // Remover un archivo adjunto y liberar memoria
  const handleRemoverEvidencia = useCallback((id: string) => {
    setEvidencias((prev) => {
      const encontrada = prev.find((e) => e.id === id);
      if (encontrada?.previewUrl) {
        URL.revokeObjectURL(encontrada.previewUrl);
      }
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  // Reemplazar un archivo de evidencia especifico por un archivo nuevo
  const handleReemplazarEvidencia = useCallback(
    (targetId: string, files: FileList | File[] | null) => {
      if (!files) return;
      const file = Array.from(files)[0];
      if (!file) return;

      // Validar tamano (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`El archivo "${file.name}" supera el tamaño máximo permitido de 10 MB.`);
        return;
      }

      // Validar tipo
      const esImagen = file.type.startsWith('image/');
      const esVideo = file.type.startsWith('video/');
      if (!esImagen && !esVideo) {
        setErrorMessage(`El archivo "${file.name}" no es una imagen o video válido.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setEvidencias((prev) =>
        prev.map((item) => {
          if (item.id === targetId) {
            if (item.previewUrl) {
              URL.revokeObjectURL(item.previewUrl);
            }
            return {
              id: item.id,
              file,
              previewUrl,
              tipo: esVideo ? 'video' : 'image',
              tamanoFormateado: formatBytes(file.size),
            };
          }
          return item;
        })
      );
    },
    []
  );

  // Limpiar URLs en desmontaje
  useEffect(() => {
    return () => {
      evidencias.forEach((e) => URL.revokeObjectURL(e.previewUrl));
    };
  }, [evidencias]);

  // Enviar alerta SOS
  const registrarReporte = async (incidentePrincipalId?: number | null) => {
    setErrorMessage(null);

    // 1. Validar coordenadas GPS
    if (!gps.coords) {
      setErrorMessage(
        'Se requiere la sincronización GPS para enviar la alerta de auxilio. Si tu navegador no tiene GPS, pulsa en el banner para usar las coordenadas de prueba.'
      );
      return;
    }
    if (!import.meta.env.DEV && gps.isSimulated) {
      setErrorMessage('Se requiere la ubicación real del dispositivo para enviar la alerta.');
      return;
    }

    // 2. Validar tipo de incidente seleccionado
    const finalTipoId = Number(tipoEmergenciaId);
    const incidenteSeleccionado = incidentesFiltrados.find(
      (i) => (i.tipoEmergenciaId || i.id) === finalTipoId
    );

    if (!finalTipoId || isNaN(finalTipoId) || !incidenteSeleccionado) {
      setErrorMessage('Por favor, selecciona un tipo de incidente válido.');
      return;
    }

    // 3. Formatear descripcion (minimo 5 caracteres para cumplir con esquema backend)
    let descripcionFinal = indicacionesRapidas.trim();
    if (descripcionFinal.length < 5) {
      descripcionFinal = `Alerta de ${incidenteSeleccionado.nombre} reportada por el ciudadano.${
        descripcionFinal ? ` Detalle: ${descripcionFinal}` : ''
      }`;
    }

    // 4. Preparar payload con tipos estrictos
    const payload = {
      institucion_destino: institucion,
      tipo_emergencia_id: finalTipoId,
      descripcion: descripcionFinal,
      latitud: Number(gps.coords.latitud.toFixed(6)),
      longitud: Number(gps.coords.longitud.toFixed(6)),
      altitud: gps.coords.altitud || 3640,
      referencia_direccion: `Coordenadas GPS sincronizadas (${gps.coords.latitud}, ${gps.coords.longitud})`,
      fecha_generacion_local: new Date().toISOString(),
      ...(incidentePrincipalId ? { incidente_principal_id: incidentePrincipalId } : {}),
    };

    if (incidentePrincipalId === undefined) {
      setIsSubmitting(true);
      setSubmittingStep('Comprobando reportes cercanos...');
      try {
        const encontrado = await buscarCoincidenciaApi(payload);
        if (encontrado) {
          setCoincidencia(encontrado);
          return;
        }
      } catch {
        setAvisoCoincidencia('No se pudo comprobar si existen reportes cercanos. Puedes enviar la alerta como independiente.');
        return;
      } finally {
        setIsSubmitting(false);
        setSubmittingStep(null);
      }
    }

    setIsSubmitting(true);
    setSubmittingStep('Registrando alerta SOS...');

    try {
      // 5. Registrar el reporte
      const reporteCreado = await crearReporteApi(payload);

      // El reporte queda confirmado antes de procesar la evidencia.
      const archivos = evidencias.map((e) => e.file);
      if (archivos.length) void uploadInBackground(reporteCreado.codigoTicket, archivos);

      // 7. Exito: Notificar y limpiar campos
      setSuccessReport({
        ...reporteCreado,
        tipoEmergenciaNombre: incidenteSeleccionado.nombre,
      });

      // 8. Guardar en cache local persistente para visualizacion inmediata en "Mis Alertas"
      try {
        const nuevoResumen: ReporteCiudadanoResumen = {
          reporteId: reporteCreado.reporteId,
          codigoTicket: reporteCreado.codigoTicket,
          estado: (reporteCreado.estado as ReporteCiudadanoResumen['estado']) || 'PENDIENTE',
          institucionDestino: institucion,
          tipoEmergencia: incidenteSeleccionado.nombre,
          descripcion: descripcionFinal,
          fechaRegistro: new Date().toISOString(),
          latitud: payload.latitud,
          longitud: payload.longitud,
          adjuntosCount: 0,
        };

        const almacenadosStr = localStorage.getItem('ampar_mis_reportes');
        const previos: ReporteCiudadanoResumen[] = almacenadosStr ? JSON.parse(almacenadosStr) : [];
        const actualizados = [
          nuevoResumen,
          ...previos.filter((p) => p.codigoTicket !== nuevoResumen.codigoTicket),
        ];
        localStorage.setItem('ampar_mis_reportes', JSON.stringify(actualizados));
        window.dispatchEvent(new CustomEvent('ampar_reporte_creado', { detail: nuevoResumen }));
      } catch (cacheErr) {
        console.warn('No se pudo guardar reporte en caché local:', cacheErr);
      }

      // Limpiar formulario para proximo envio
      setIndicacionesRapidas('');
      setEvidencias([]);
      setCoincidencia(null);
      setAvisoCoincidencia(null);
    } catch (err: unknown) {
      const errorStr = err instanceof Error ? err.message : 'Error al registrar la alerta de auxilio.';
      setErrorMessage(errorStr);
    } finally {
      setIsSubmitting(false);
      setSubmittingStep(null);
    }
  };

  const handleEnviarReporte = () => void registrarReporte();
  const confirmarCoincidencia = () => {
    if (!coincidencia) return;
    const id = coincidencia.reporteId;
    setCoincidencia(null);
    void registrarReporte(id);
  };
  const enviarReporteIndependiente = () => {
    setCoincidencia(null);
    setAvisoCoincidencia(null);
    void registrarReporte(null);
  };

  const handleCerrarExito = useCallback(() => {
    setSuccessReport(null);
  }, []);

  return {
    gps,
    institucion,
    tipoEmergenciaId,
    indicacionesRapidas,
    evidencias,
    incidentesFiltrados,
    isSubmitting,
    submittingStep,
    errorMessage,
    successReport,
    coincidencia,
    avisoCoincidencia,
    evidenceUpload,
    retryEvidenceUpload: () => { if (retryUpload) void uploadInBackground(retryUpload.ticket, retryUpload.files); },
    confirmarCoincidencia,
    enviarReporteIndependiente,
    cancelarCoincidencia: () => setCoincidencia(null),
    cambiarInstitucion,
    setTipoEmergenciaId,
    setIndicacionesRapidas,
    handleAdjuntarArchivos,
    handleRemoverEvidencia,
    handleReemplazarEvidencia,
    handleEnviarReporte,
    handleCerrarExito,
  };
}
