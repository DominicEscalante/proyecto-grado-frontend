// Public API del módulo de Administración de Usuarios (Feature-First)

// Componentes del Layout Split-View / Master-Detail
export { CompactHeaderSummary } from './components/CompactHeaderSummary.js';
export { Toolbar } from './components/Toolbar.js';
export { UserMasterList } from './components/UserMasterList.js';
export { UserDetailInspector } from './components/UserDetailInspector.js';

// Modales de Acción
export { CreateOperatorModal } from './components/CreateOperatorModal.js';
export { EditUserModal } from './components/EditUserModal.js';
export { ToggleStatusModal } from './components/ToggleStatusModal.js';
export { ResetPasswordModal } from './components/ResetPasswordModal.js';

// Hooks
export { useAdminUsers } from './hooks/useAdminUsers.js';

// Tipos
export type {
  AdminUserItem,
  RoleFilter,
  StatusFilter,
  UserMetrics,
  AdminUsersQueryParams,
  AdminUsersListResponse,
  CreateOperatorData,
  EditUserData,
  ChangeUserStatusData,
} from './types/admin-users.types.js';

// Utilidades
export { getInitials, formatDate, exportUsersToCsv } from './utils/user-formatters.js';
