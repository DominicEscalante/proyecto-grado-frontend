export interface User {
  id: string;
  name: string;
  email: string;
  ci: string;
  complemento?: string | null;
  nombres: string;
  apellidos: string;
  telefono: string;
  institucion?: 'POLICIA' | 'BOMBEROS' | null;
  rango?: string | null;
  rol_id: number;
  identidad_verificada: boolean;
  estado_cuenta: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  identificador: string;
  password: string;
}

export interface RegisterCitizenData {
  nombres: string;
  apellidos: string;
  ci: string;
  complemento?: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthSessionResponse {
  user: User;
  token?: string;
  session?: {
    id: string;
    expiresAt: string;
    [key: string]: unknown;
  };
}
