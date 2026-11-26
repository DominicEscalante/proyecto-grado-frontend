
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  MAX_EVIDENCE_FILES,
} from '../utils/report-formatters.js';
import { useGpsLocation } from './useGpsLocation.js';
import { optimizeEvidence } from '../utils/optimize-evidence.js';

const EVIDENCE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm', 'video/mp4', 'video/quicktime',
]);

export function useCitizenReportForm() {
  const gps = useGpsLocation();

  const [institucion, setInstitucion] = useState<InstitucionDestino>('BOMBEROS');
  const [catalogoTotal, setCatalogoTotal] = useState<TipoEmergenciaItem[]>(CATALOGO_EMERGENCIAS_DEFAULT);
  const [tipoEmergenciaId, setTipoEmergenciaId] = useState<number>(4); // Default: Incendio Estructural
  const [indicacionesRapidas, setIndicacionesRapidas] = useState<string>('');
  const [evidencias, setEvidencias] = useState<EvidenciaArchivo[]>([]);

  const previousEvidence = useRef<EvidenciaArchivo[]>([]);

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

  const incidentesFiltrados = useMemo(() => {
    return filtrarIncidentesPorInstitucion(catalogoTotal, institucion);
  }, [catalogoTotal, institucion]);

  useEffect(() => {
    let isMounted = true;
    getCatalogoEmergenciasApi()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCatalogoTotal(data);
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

  const handleAdjuntarArchivos = useCallback(
    (files: FileList | File[] | null) => {
      if (!files) return;
      const fileArray = Array.from(files);
      setErrorMessage(null);

      const maxPermitidos = MAX_EVIDENCE_FILES - evidencias.length;
      if (fileArray.length > maxPermitidos) {
        setErrorMessage(`Puedes adjuntar hasta ${MAX_EVIDENCE_FILES} archivos por reporte.`);
      }
      if (maxPermitidos <= 0) return;

      const archivosAProcesar = fileArray.slice(0, maxPermitidos);
      const nuevasEvidencias: EvidenciaArchivo[] = [];

      for (const file of archivosAProcesar) {
        if (file.size > 10 * 1024 * 1024) {
          setErrorMessage(`El archivo "${file.name}" supera el tamaño máximo permitido de 10 MB.`);
          continue;
        }

        const esVideo = file.type.startsWith('video/');
        if (!EVIDENCE_TYPES.has(file.type)) {
          setErrorMessage(`El archivo "${file.name}" debe ser JPEG, PNG, WebP, MP4, MOV, MP3, M4A, OGG, WAV o WebM de audio.`);
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        nuevasEvidencias.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl,
          tipo: file.type.startsWith('audio/') ? 'audio' : esVideo ? 'video' : 'image',
          tamanoFormateado: formatBytes(file.size),
        });
      }

      if (nuevasEvidencias.length > 0) {
        setEvidencias((prev) => [...prev, ...nuevasEvidencias]);
      }
    },
    [evidencias]
  );

  const handleRemoverEvidencia = useCallback((id: string) => {
    setEvidencias((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleReemplazarEvidencia = useCallback(
    (targetId: string, files: FileList | File[] | null) => {
      if (!files) return;
      const file = Array.from(files)[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`El archivo "${file.name}" supera el tamaño máximo permitido de 10 MB.`);
        return;
      }

      const esVideo = file.type.startsWith('video/');
      if (!EVIDENCE_TYPES.has(file.type)) {
        setErrorMessage(`El archivo "${file.name}" debe ser JPEG, PNG, WebP, MP4, MOV, MP3, M4A, OGG, WAV o WebM de audio.`);
        return;
      }

      setErrorMessage(null);
      const previewUrl = URL.createObjectURL(file);
      setEvidencias((prev) =>
        prev.map((item) => {
          if (item.id === targetId) {

            return {
              id: item.id,
              file,
              previewUrl,
              tipo: file.type.startsWith('audio/') ? 'audio' : esVideo ? 'video' : 'image',
              tamanoFormateado: formatBytes(file.size),
            };
          }
          return item;
        })
      );
    },
    []
  );

  useEffect(() => {
    const activeUrls = new Set(evidencias.map((item) => item.previewUrl));
    for (const item of previousEvidence.current) {
      if (!activeUrls.has(item.previewUrl)) URL.revokeObjectURL(item.previewUrl);
    }
    previousEvidence.current = evidencias;
  }, [evidencias]);

  useEffect(() => () => {
    previousEvidence.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }, []);

  const registrarReporte = async (incidentePrincipalId?: number | null) => {
    setErrorMessage(null);

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

    const finalTipoId = Number(tipoEmergenciaId);
    const incidenteSeleccionado = incidentesFiltrados.find(
      (i) => (i.tipoEmergenciaId || i.id) === finalTipoId
    );

    if (!finalTipoId || isNaN(finalTipoId) || !incidenteSeleccionado) {
      setErrorMessage('Por favor, selecciona un tipo de incidente válido.');
      return;
    }

    if (/[^\P{Cc}\t\n\r]|[\u202A-\u202E\u2066-\u2069]/u.test(indicacionesRapidas)) {
      setErrorMessage('Las indicaciones contienen caracteres de control no permitidos.');
      return;
    }
    let descripcionFinal = indicacionesRapidas.trim();
    if (descripcionFinal.length < 5) {
      descripcionFinal = `Alerta de ${incidenteSeleccionado.nombre} reportada por el ciudadano.${
        descripcionFinal ? ` Detalle: ${descripcionFinal}` : ''
      }`;
    }

    const payload = {
      institucion_destino: institucion,
      tipo_emergencia_id: finalTipoId,
      descripcion: descripcionFinal,
      latitud: Number(gps.coords.latitud.toFixed(6)),
      longitud: Number(gps.coords.longitud.toFixed(6)),
      altitud: gps.coords.altitud,
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
      const reporteCreado = await crearReporteApi(payload);

      // El reporte queda confirmado antes de procesar la evidencia.
      const archivos = evidencias.map((e) => e.file);
      if (archivos.length) void uploadInBackground(reporteCreado.codigoTicket, archivos);

      setSuccessReport({
        ...reporteCreado,
        tipoEmergenciaNombre: incidenteSeleccionado.nombre,
      });

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
