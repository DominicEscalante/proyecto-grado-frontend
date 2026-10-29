import React from 'react';
import { AppHeader } from '../components/layout/index.js';
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full bg-[#F4F7F4] text-[#143601] flex flex-col justify-between selection:bg-[#245501] selection:text-white">
      {/* 1. Header Superior Minimalista Blanco con Perfil Desplegable */}
      <AppHeader />

      {/* 2. Contenido Central (Split-View / Master-Detail de alta densidad en Blanco y Neutros Claros) */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-3 sm:p-4 lg:py-2.5 lg:px-6 flex flex-col gap-2 sm:gap-2.5 overflow-y-auto lg:overflow-hidden">
        {/* Cabecera de Sección con Botones Globales a la Derecha */}
        <section aria-label="Resumen institucional" className="shrink-0">
          <CompactHeaderSummary
            onExportCsv={handleExportCsv}
            onNewOperator={openCreate}
          />
        </section>

        {/* Master-Detail Split-View Layout */}
        <section
          aria-label="Directorio y Ficha de Cuenta"
          className="flex-1 min-h-0 lg:grid lg:grid-cols-12 lg:gap-4 xl:gap-5 items-stretch"
        >
          {/* Columna Izquierda: Master List con Toolbar Unificada Integrada (lg:col-span-8) */}
          <div className="lg:col-span-8 h-full min-h-0 flex flex-col">
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
          <div className="lg:col-span-4 h-full min-h-0">
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
      <footer className="shrink-0 w-full text-center py-2 sm:py-2.5 text-[10px] sm:text-[11px] text-stone-500 font-medium border-t border-stone-200 bg-white">
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
