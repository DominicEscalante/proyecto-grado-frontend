import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol_id)) {
    if (user.rol_id === 4) {
      return <Navigate to="/admin/usuarios" replace />;
    }
    if (user.rol_id === 2 || user.rol_id === 3) {
      return <Navigate to="/operador/emergencias" replace />;
    }
    return <Navigate to="/ciudadano/reportes" replace />;
  }

  return <>{children}</>;
};
