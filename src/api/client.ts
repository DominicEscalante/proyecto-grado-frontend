import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/api.types.js';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para inyectar token de autorizacion y credenciales dev locales
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Soporte de identidad en desarrollo local para evitar desconexiones de sesion
  const authUserStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
  if (authUserStr && config.headers) {
    try {
      const authUser = JSON.parse(authUserStr);
      if (authUser?.id) {
        config.headers['x-user-id'] = authUser.id;
        config.headers['x-dev-user-id'] = authUser.id;
        if (authUser.rol_id) {
          config.headers['x-dev-rol-id'] = String(authUser.rol_id);
        }
      }
    } catch {
      // Ignorar JSON corrupto
    }
  }

  return config;
});

interface DetailedApiError extends ApiErrorResponse {
  details?: Array<{ campo?: string; mensaje?: string }>;
}

// Formateador de errores consistente
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<DetailedApiError>;
    const responseData = axiosErr.response?.data;

    if (responseData?.details && Array.isArray(responseData.details) && responseData.details.length > 0) {
      const detailsText = responseData.details
        .map((d) => (d.campo ? `${d.campo}: ${d.mensaje}` : d.mensaje))
        .filter(Boolean)
        .join(', ');
      return `${responseData.message || 'Error de validación'}: ${detailsText}`;
    }

    if (responseData?.message) {
      return responseData.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return 'Ocurrio un error inesperado al procesar la solicitud.';
}
