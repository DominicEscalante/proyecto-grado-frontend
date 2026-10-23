// Public API del modulo de autenticacion (Feature-First)

// Componentes
export { CitizenLoginForm, LoginForm } from './components/CitizenLoginForm.js';
export type { LoginFormProps } from './components/CitizenLoginForm.js';
export { OperatorLoginForm } from './components/OperatorLoginForm.js';
export { RegisterForm } from './components/RegisterForm.js';
export type { RegisterFormProps } from './components/RegisterForm.js';

// Hooks
export { useLogin } from './hooks/useLogin.js';
export { useRegister } from './hooks/useRegister.js';

// Tipos
export type {
  User,
  LoginCredentials,
  RegisterCitizenData,
  AuthSessionResponse,
} from './types/auth.types.js';

// Validadores y esquemas
export {
  loginSchema,
  registerCitizenSchema,
} from './utils/auth.validators.js';
export type {
  LoginFormValues,
  RegisterCitizenFormValues,
} from './utils/auth.validators.js';

// Peticiones API
export {
  loginRequest,
  registerCitizenRequest,
  getCurrentUserRequest,
  logoutRequest,
} from './api/auth.api.js';
