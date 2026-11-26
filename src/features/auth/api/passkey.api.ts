import { createAuthClient } from 'better-auth/client';
import { passkeyClient } from '@better-auth/passkey/client';
import { apiClient } from '../../../api/client.js';
import type { User } from '../types/auth.types.js';
import type { ApiResponse } from '../../../types/api.types.js';

const createPasskeyClient = (token?: string) => createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  plugins: [passkeyClient()],
  fetchOptions: {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  },
});

export async function enrollPasskey(password?: string): Promise<void> {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const { error } = await createPasskeyClient(token ?? undefined).passkey.addPasskey(password ? {
    fetchOptions: { headers: { 'x-ampar-enrollment-password': password } },
  } : undefined);
  if (error) throw new Error('No se pudo registrar la clave de acceso.');
}

export async function signInWithPasskey(): Promise<{ user: User; token: string }> {
  const { data, error } = await createPasskeyClient().signIn.passkey();
  const token = data?.session?.token;
  if (error || !token) throw new Error('No se pudo iniciar sesión con la clave de acceso.');

  const response = await apiClient.get<ApiResponse<{ user: User }>>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    skipStoredAuth: true,
  });
  return { user: response.data.data.user, token };
}

export async function confirmBackupPasskey(): Promise<string> {
  const { data, error } = await createPasskeyClient().signIn.passkey({
    fetchOptions: { headers: { 'x-ampar-backup': '1' } },
  });
  if (error || !data?.session?.token) throw new Error('No se pudo confirmar la clave de acceso.');
  return data.session.token;
}
