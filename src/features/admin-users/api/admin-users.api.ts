import { apiClient } from '../../../api/client.js';
import { ApiResponse } from '../../../types/api.types.js';
import {
  AdminUserItem,
  AdminUsersQueryParams,
  AdminUsersListResponse,
  CreateOperatorData,
  EditUserData,
  ChangeUserStatusData,
} from '../types/admin-users.types.js';

export async function fetchUsersList(
  params?: AdminUsersQueryParams
): Promise<AdminUsersListResponse> {
  const response = await apiClient.get<ApiResponse<AdminUsersListResponse>>(
    '/api/admin/usuarios',
    { params }
  );
  return response.data.data;
}

export async function fetchUserById(id: string): Promise<AdminUserItem> {
  const response = await apiClient.get<ApiResponse<AdminUserItem>>(
    `/api/admin/usuarios/${id}`
  );
  return response.data.data;
}

export async function createOperatorRequest(
  data: CreateOperatorData
): Promise<AdminUserItem> {
  const response = await apiClient.post<ApiResponse<AdminUserItem>>(
    '/api/admin/operadores',
    data
  );
  return response.data.data;
}

export async function editUserRequest(
  id: string,
  data: EditUserData
): Promise<AdminUserItem> {
  const response = await apiClient.patch<ApiResponse<AdminUserItem>>(
    `/api/admin/usuarios/${id}`,
    data
  );
  return response.data.data;
}

export async function changeUserStatusRequest(
  id: string,
  data: ChangeUserStatusData
): Promise<AdminUserItem> {
  const response = await apiClient.patch<ApiResponse<AdminUserItem>>(
    `/api/admin/usuarios/${id}/estado`,
    data
  );
  return response.data.data;
}

export async function resetUserPasswordRequest(
  id: string,
  password: string
): Promise<{ mensaje: string }> {
  const response = await apiClient.patch<ApiResponse<{ mensaje: string }>>(
    `/api/admin/usuarios/${id}/password`,
    { password }
  );
  return response.data.data;
}
