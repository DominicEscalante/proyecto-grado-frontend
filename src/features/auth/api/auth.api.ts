import { apiClient } from '../../../api/client.js';
import { ApiResponse } from '../../../types/api.types.js';
import {
  LoginCredentials,
  RegisterCitizenData,
  AuthSessionResponse,
  User,
} from '../types/auth.types.js';

export async function loginRequest(
  credentials: LoginCredentials
): Promise<AuthSessionResponse> {
  const response = await apiClient.post<ApiResponse<AuthSessionResponse>>(
    '/api/auth/login',
    credentials
  );
  return response.data.data;
}

export async function registerCitizenRequest(
  data: RegisterCitizenData
): Promise<AuthSessionResponse> {
  const payload = {
    email: data.email,
    password: data.password,
    ci: data.ci,
    complemento: data.complemento || undefined,
    nombres: data.nombres,
    apellidos: data.apellidos,
    telefono: data.telefono,
  };

  const response = await apiClient.post<ApiResponse<AuthSessionResponse>>(
    '/api/auth/registro',
    payload
  );
  return response.data.data;
}

export async function getCurrentUserRequest(): Promise<{
  user: User;
  session?: unknown;
}> {
  const response = await apiClient.get<
    ApiResponse<{ user: User; session?: unknown }>
  >('/api/auth/me');
  return response.data.data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiClient.post('/api/auth/sign-out');
  } catch {
    // Falla silenciosa si la sesion ya expiro
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
