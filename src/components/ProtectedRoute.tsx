import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
  passwordSetup?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  passwordSetup = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.cambio_password_pendiente && !passwordSetup) {
    return <Navigate to="/operador/password-inicial" replace />;
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

  if (passwordSetup && !user.cambio_password_pendiente) {
    return <Navigate to="/operador/emergencias" replace />;
  }

  return <>{children}</>;
};
