export interface AdminUserItem {
  id: string;
  usuarioId: number;
  name: string;
  email: string;
  ci: string;
  complemento: string | null;
  nombres: string;
  apellidos: string;
  telefono: string;
  institucion: 'POLICIA' | 'BOMBEROS' | null;
  rango: string | null;
  identidadVerificada: boolean;
  estadoCuenta: boolean;
  createdAt: string;
  updatedAt: string;
  rol: {
    rolId: number;
    nombre: string;
    descripcion: string | null;
  };
}

export type RoleFilter = 'ALL' | 'CITIZEN' | 'POLICE' | 'FIREFIGHTER' | 'ADMIN';
export type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED';

export interface AdminUsersQueryParams {
  busqueda?: string;
  rol_id?: number;
  institucion?: 'POLICIA' | 'BOMBEROS' | 'NINGUNA' | 'TODOS';
  estado_cuenta?: 'true' | 'false' | 'TODOS';
  pagina?: number;
  limite?: number;
}

export interface AdminUsersListResponse {
  items: AdminUserItem[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface CreateOperatorData {
  email: string;
  password: string;
  ci: string;
  complemento?: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  institucion: 'POLICIA' | 'BOMBEROS';
  rango: string;
  rol_id: 2 | 3;
}

export interface EditUserData {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  institucion?: 'POLICIA' | 'BOMBEROS';
  rango?: string;
  rol_id?: number;
  estado_cuenta?: boolean;
}

export interface ChangeUserStatusData {
  estado_cuenta: boolean;
  motivo?: string;
}

export interface UserMetrics {
  total: number;
  citizens: number;
  police: number;
  firefighters: number;
  admins: number;
}
