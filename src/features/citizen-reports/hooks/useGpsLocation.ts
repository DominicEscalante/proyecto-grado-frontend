// Hook para adquisicion y sincronizacion de ubicacion GPS en tiempo real

import { useState, useEffect, useCallback } from 'react';
import {
  GpsLocationState,
  GpsCoordinates,
} from '../types/citizen-reports.types.js';
import { COORDENADAS_DEFAULT_LA_PAZ } from '../utils/report-formatters.js';

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

  // Sincronizacion inicial automatica
  useEffect(() => {
    sincronizarGps();
  }, [sincronizarGps]);

  return {
    ...gpsState,
    sincronizarGps,
    usarCoordenadasPruebaLaPaz,
  };
}
