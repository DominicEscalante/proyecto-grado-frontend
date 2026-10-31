import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage.js';
import { CitizenDashboardPage } from '../pages/CitizenDashboardPage.js';
import { OperatorDashboardPage } from '../pages/OperatorDashboardPage.js';
import { OperatorHistoryPage } from '../pages/OperatorHistoryPage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { VerifyIdentityPage } from '../pages/VerifyIdentityPage.js';
import { ProtectedRoute } from '../components/ProtectedRoute.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <LoginPage />,
    children: [
      { path: '/login' },
      { path: '/registro' },
    ],
  },
  {
    path: '/verificar-identidad',
    element: (
      <ProtectedRoute allowedRoles={[1]}>
        <VerifyIdentityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ciudadano/reportes',
    element: (
      <ProtectedRoute allowedRoles={[1]}>
        <CitizenDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/operador/emergencias',
    element: (
      <ProtectedRoute allowedRoles={[2, 3]}>
        <OperatorDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/operador/historial',
    element: (
      <ProtectedRoute allowedRoles={[2, 3]}>
        <OperatorHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/usuarios',
    element: (
      <ProtectedRoute allowedRoles={[4]}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
