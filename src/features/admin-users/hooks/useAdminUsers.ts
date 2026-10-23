import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AdminUserItem,
  RoleFilter,
  StatusFilter,
  UserMetrics,
  CreateOperatorData,
  EditUserData,
} from '../types/admin-users.types.js';
import {
  fetchUsersList,
  createOperatorRequest,
  editUserRequest,
  changeUserStatusRequest,
  resetUserPasswordRequest,
} from '../api/admin-users.api.js';
import { exportUsersToCsv } from '../utils/user-formatters.js';
import { handleApiError } from '../../../api/client.js';
import { sileo } from 'sileo';

export function useAdminUsers() {
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Master-Detail: usuario seleccionado e inspección
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Estado de modales complementarios
  const [modalState, setModalState] = useState<'none' | 'create' | 'edit' | 'status' | 'reset-password'>('none');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsersList({ limite: 100 });
      if (data?.items) {
        setUsersList(data.items);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Metricas calculadas en tiempo real para el resumen inline
  const metrics: UserMetrics = useMemo(() => {
    let citizens = 0;
    let police = 0;
    let firefighters = 0;
    let admins = 0;

    usersList.forEach((u) => {
      const rolId = u.rol?.rolId;
      if (rolId === 1) citizens++;
      else if (rolId === 2) police++;
      else if (rolId === 3) firefighters++;
      else if (rolId === 4) admins++;
    });

    return {
      total: usersList.length,
      citizens,
      police,
      firefighters,
      admins,
    };
  }, [usersList]);

  // Filtrado compuesto por Rol, Estado y Buscador
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const rolId = u.rol?.rolId;

      // Filtro por Rol / Institucion
      if (activeFilter === 'CITIZEN' && rolId !== 1) return false;
      if (activeFilter === 'POLICE' && rolId !== 2) return false;
      if (activeFilter === 'FIREFIGHTER' && rolId !== 3) return false;
      if (activeFilter === 'ADMIN' && rolId !== 4) return false;

      // Filtro por Estado (Activo / Suspendido)
      if (statusFilter === 'ACTIVE' && !u.estadoCuenta) return false;
      if (statusFilter === 'SUSPENDED' && u.estadoCuenta) return false;

      // Filtro textual
      if (!searchTerm || searchTerm.trim() === '') return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.ci?.toLowerCase().includes(term) ||
        u.telefono?.includes(term) ||
        (u.rango && u.rango.toLowerCase().includes(term))
      );
    });
  }, [usersList, activeFilter, statusFilter, searchTerm]);

  // Auto-seleccionar primer usuario en desktop si no hay selección válida
  useEffect(() => {
    if (filteredUsers.length > 0) {
      if (!selectedUser || !filteredUsers.some((u) => u.id === selectedUser.id)) {
        setSelectedUser(filteredUsers[0]);
      }
    } else {
      setSelectedUser(null);
    }
  }, [filteredUsers, selectedUser]);

  // Acciones sobre usuarios con notificaciones Sileo Toast
  const handleCreateOperator = async (data: CreateOperatorData) => {
    setActionLoading(true);
    setError(null);
    try {
      await createOperatorRequest(data);
      await loadUsers();
      setModalState('none');
      sileo.success({
        title: 'Operador registrado',
        description: `Se creó la cuenta para ${data.nombres} ${data.apellidos} (${data.institucion}).`,
      });
    } catch (err) {
      const msg = handleApiError(err);
      sileo.error({
        title: 'Error al registrar operador',
        description: msg,
      });
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (id: string, data: EditUserData) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await editUserRequest(id, data);
      await loadUsers();
      setSelectedUser((prev) => (prev?.id === id ? { ...prev, ...updated } : prev));
      setModalState('none');
      sileo.success({
        title: 'Usuario actualizado',
        description: 'La información del usuario ha sido guardada correctamente.',
      });
    } catch (err) {
      const msg = handleApiError(err);
      sileo.error({
        title: 'Error al actualizar usuario',
        description: msg,
      });
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: boolean, motivo?: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await changeUserStatusRequest(id, { estado_cuenta: newStatus, motivo });
      await loadUsers();
      setSelectedUser((prev) => (prev?.id === id ? { ...prev, ...updated, estadoCuenta: newStatus } : prev));
      setModalState('none');

      if (newStatus) {
        sileo.success({
          title: 'Cuenta reactivada',
          description: 'El usuario ya puede iniciar sesión en la plataforma.',
        });
      } else {
        sileo.warning({
          title: 'Cuenta suspendida',
          description: 'El acceso del usuario a la plataforma ha sido suspendido.',
        });
      }
    } catch (err) {
      const msg = handleApiError(err);
      sileo.error({
        title: 'Error al cambiar estado',
        description: msg,
      });
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (id: string, newPass: string) => {
    setActionLoading(true);
    setError(null);
    try {
      await resetUserPasswordRequest(id, newPass);
      setModalState('none');
      sileo.success({
        title: 'Credenciales restablecidas',
        description: 'La contraseña de acceso se actualizó exitosamente.',
      });
    } catch (err) {
      const msg = handleApiError(err);
      sileo.error({
        title: 'Error al restablecer contraseña',
        description: msg,
      });
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    try {
      exportUsersToCsv(filteredUsers);
      sileo.info({
        title: 'Exportación CSV generada',
        description: `Se descargaron ${filteredUsers.length} registros del directorio.`,
      });
    } catch (err) {
      sileo.error({
        title: 'Error en la exportación',
        description: 'No se pudo generar el archivo CSV.',
      });
    }
  };

  const handleSelectUser = (u: AdminUserItem) => {
    setSelectedUser(u);
    setIsMobileDrawerOpen(true);
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  const openCreate = () => setModalState('create');
  const openEdit = () => setModalState('edit');
  const openStatus = () => setModalState('status');
  const openResetPassword = () => setModalState('reset-password');
  const closeModal = () => setModalState('none');

  return {
    users: filteredUsers,
    rawCount: usersList.length,
    metrics,
    loading,
    actionLoading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    statusFilter,
    setStatusFilter,
    selectedUser,
    isMobileDrawerOpen,
    modalState,
    loadUsers,
    handleSelectUser,
    closeMobileDrawer,
    handleCreateOperator,
    handleEditUser,
    handleToggleStatus,
    handleResetPassword,
    handleExportCsv,
    openCreate,
    openEdit,
    openStatus,
    openResetPassword,
    closeModal,
  };
}
