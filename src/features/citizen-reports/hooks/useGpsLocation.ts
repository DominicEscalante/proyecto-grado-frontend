// Hook para adquisicion y sincronizacion de ubicacion GPS en tiempo real

import { useState, useEffect, useCallback } from 'react';
import {
  GpsLocationState,
  GpsCoordinates,
} from '../types/citizen-reports.types.js';
import { COORDENADAS_DEFAULT_LA_PAZ } from '../utils/report-formatters.js';

const GPS_PERMISSION_STORAGE_KEY = 'ampar_gps_permission_granted';

export function useGpsLocation() {
  const [gpsState, setGpsState] = useState<GpsLocationState>({
    status: 'obtaining',
    coords: null,
    errorMessage: null,
    isSimulated: false,
  });

  const sincronizarGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsState({
        status: 'error',
        coords: null,
        errorMessage: 'El dispositivo o navegador no soporta geolocalizacion.',
        isSimulated: false,
      });
      return;
    }

    setGpsState((prev) => ({
      ...prev,
      status: 'obtaining',
      errorMessage: null,
    }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GpsCoordinates = {
          latitud: Number(position.coords.latitude.toFixed(6)),
          longitud: Number(position.coords.longitude.toFixed(6)),
          altitud: position.coords.altitude ? Math.round(position.coords.altitude) : 3640,
          precisionMetros: Math.round(position.coords.accuracy),
          timestamp: position.timestamp,
        };

        setGpsState({
          status: 'synchronized',
          coords,
          errorMessage: null,
          isSimulated: false,
        });
      },
      (error) => {
        let msg = 'No fue posible obtener las coordenadas GPS.';
        let isDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Permiso de ubicacion denegado por el usuario o navegador.';
            isDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Senal GPS no disponible en este momento.';
            break;
          case error.TIMEOUT:
            msg = 'Tiempo de espera agotado al consultar el sensor GPS.';
            break;
        }

        setGpsState({
          status: isDenied ? 'denied' : 'error',
          coords: null,
          errorMessage: msg,
          isSimulated: false,
        });
      },
      options
    );
  }, []);

  // Forzar simulacion de coordenadas en La Paz para pruebas de desarrollo local
  const usarCoordenadasPruebaLaPaz = useCallback(() => {
    if (!import.meta.env.DEV) return;
    const coords: GpsCoordinates = {
      latitud: COORDENADAS_DEFAULT_LA_PAZ.latitud,
      longitud: COORDENADAS_DEFAULT_LA_PAZ.longitud,
      altitud: COORDENADAS_DEFAULT_LA_PAZ.altitud,
      precisionMetros: COORDENADAS_DEFAULT_LA_PAZ.precisionMetros,
      timestamp: Date.now(),
    };

    setGpsState({
      status: 'synchronized',
      coords,
      errorMessage: null,
      isSimulated: true,
    });
  }, []);

  // Consultar el permiso del navegador al entrar al sistema. Si no está concedido,
  // solicitarlo en cada entrada; solo persistir la confirmación del navegador.
  useEffect(() => {
    let cancelled = false;

    const solicitarUbicacion = async () => {
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (cancelled) return;

          if (permission.state === 'granted') {
            localStorage.setItem(GPS_PERMISSION_STORAGE_KEY, 'true');
            sincronizarGps();
            return;
          }
        }

        // La solicitud del navegador se repetirá al volver a entrar si el permiso
        // no fue concedido. El navegador controla su propio diálogo de permisos.
        sincronizarGps();
      } catch {
        // Algunos navegadores no soportan Permissions API; geolocation sigue
        // siendo la fuente de verdad para solicitar y confirmar el permiso.
        if (!cancelled) sincronizarGps();
      }
    };

    solicitarUbicacion();
    return () => {
      cancelled = true;
    };
  }, [sincronizarGps]);

  return {
    ...gpsState,
    sincronizarGps,
    usarCoordenadasPruebaLaPaz,
  };
}
