import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { AppLogo } from '../components/ui/index.js';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import {
  CompactHeaderSummary,
  UserMasterList,
  UserDetailInspector,
  CreateOperatorModal,
  EditUserModal,
  ToggleStatusModal,
  ResetPasswordModal,
  useAdminUsers,
} from '../features/admin-users/index.js';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    users,
    rawCount,
    metrics,
    loading,
    actionLoading,
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
  } = useAdminUsers();

  return (
    <div className="min-h-screen w-full bg-[#F4F7F4] text-[#143601] flex flex-col justify-between selection:bg-[#245501] selection:text-white">
      {/* 1. Header Superior Institucional en Verde Más Oscuro de la Paleta (#143601) */}
      <header className="sticky top-0 z-30 w-full bg-[#143601] border-b border-[#1a4301] shadow-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <AppLogo size={34} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">AMPAR</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1a4301] text-white/90 border border-white/10 font-mono">
                Administración General
              </span>
            </div>
            <p className="text-[11px] text-white/75">
              Supervisión de Cuentas y Despacho Operativo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user?.name || 'Administrador'}</p>
            <p className="text-[10px] text-white/70 font-mono">{user?.email}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a4301] hover:bg-[#245501] text-white text-xs font-medium border border-white/20 transition-colors focus:outline-none shadow-xs"
            title="Cerrar Sesión"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4 text-white/80" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* 2. Contenido Central (Split-View / Master-Detail de alta densidad en Blanco y Neutros Claros) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Cabecera de Sección con Botones Globales a la Derecha */}
        <section aria-label="Resumen institucional">
          <CompactHeaderSummary
            onExportCsv={handleExportCsv}
            onNewOperator={openCreate}
          />
        </section>

        {/* Master-Detail Split-View Layout */}
        <section
          aria-label="Directorio y Ficha de Cuenta"
          className="lg:grid lg:grid-cols-12 lg:gap-6 items-start"
        >
          {/* Columna Izquierda: Master List con Toolbar Unificada Integrada (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <UserMasterList
              users={users}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
              loading={loading}
              totalCount={rawCount}
              metrics={metrics}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              statusFilter={statusFilter}
              onSelectStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onRefresh={loadUsers}
            />
          </div>

          {/* Columna Derecha: Detail Inspector (lg:col-span-4 / Sticky en desktop, Drawer en móvil) */}
          <div className="lg:col-span-4">
            <UserDetailInspector
              user={selectedUser}
              isMobileDrawerOpen={isMobileDrawerOpen}
              onCloseDrawer={closeMobileDrawer}
              onEdit={() => openEdit()}
              onResetPassword={() => openResetPassword()}
              onToggleStatus={() => openStatus()}
            />
          </div>
        </section>
      </main>

      {/* 3. Pie de Página Institucional */}
      <footer className="w-full text-center py-4 text-[11px] text-stone-500 font-medium border-t border-stone-200 bg-white">
        Gobierno Autónomo Municipal de La Paz · Plataforma Integral de Emergencias AMPAR
      </footer>

      {/* 4. Modales de Gestión Administrativa */}
      {modalState === 'create' && (
        <CreateOperatorModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={handleCreateOperator}
          loading={actionLoading}
        />
      )}

      {modalState === 'edit' && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={closeModal}
          onSubmit={handleEditUser}
          loading={actionLoading}
        />
      )}

      {modalState === 'status' && selectedUser && (
        <ToggleStatusModal
          user={selectedUser}
          onClose={closeModal}
          onSubmit={handleToggleStatus}
          loading={actionLoading}
        />
      )}

      {modalState === 'reset-password' && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={closeModal}
          onSubmit={handleResetPassword}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
