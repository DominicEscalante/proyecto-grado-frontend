import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/api.types.js';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipStoredAuth?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (config.skipStoredAuth) return config;
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface DetailedApiError extends ApiErrorResponse {
  details?: Array<{ campo?: string; mensaje?: string }>;
  error?: Pick<DetailedApiError, 'message' | 'details'>;
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<DetailedApiError>;
    const responseBody = axiosErr.response?.data;
    const responseData = responseBody?.error ?? responseBody;

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
