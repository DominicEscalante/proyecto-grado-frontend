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
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden w-full bg-[#F4F7F4] text-[#143601] flex flex-col justify-between selection:bg-[#245501] selection:text-white">
      <AppHeader fullWidth />

      <main className="flex-1 min-h-0 min-w-0 w-full p-3 sm:p-4 lg:py-2.5 lg:px-6 flex flex-col gap-2 sm:gap-2.5 lg:overflow-hidden">
        <section aria-label="Resumen institucional" className="shrink-0">
          <CompactHeaderSummary
            onExportCsv={handleExportCsv}
            onNewOperator={openCreate}
          />
        </section>

        <section
          aria-label="Directorio y Ficha de Cuenta"
          className="flex-1 min-h-0 min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30%)] lg:gap-4 xl:gap-5 items-stretch"
        >
          <div className="lg:h-full min-h-0 min-w-0 flex flex-col">
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

          <div className="lg:h-full min-h-0 min-w-0">
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

      <footer className="shrink-0 w-full text-center px-3 py-2 sm:py-2.5 text-[10px] sm:text-[11px] text-stone-500 font-medium border-t border-stone-200 bg-white">
        Gobierno Autónomo Municipal de La Paz · Plataforma Integral de Emergencias AMPAR
      </footer>

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
