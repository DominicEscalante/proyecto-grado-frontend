import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterCitizenData } from '../features/auth/types/auth.types.js';
import {
  loginRequest,
  registerCitizenRequest,
  getCurrentUserRequest,
  logoutRequest,
} from '../features/auth/api/auth.api.js';
import { SplashScreen } from '../components/ui/index.js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterCitizenData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const { user: fetchedUser } = await getCurrentUserRequest();
          setUser(fetchedUser);
          localStorage.setItem('auth_user', JSON.stringify(fetchedUser));
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      } else {
        const cachedUser = localStorage.getItem('auth_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            localStorage.removeItem('auth_user');
          }
        }
      }

      // Transicion visual suave para apreciar el logo creativo del sistema
      setTimeout(() => {
        setIsLoading(false);
      }, 700);
    }

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await loginRequest(credentials);
      const token = result.token || (result.session as any)?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterCitizenData): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await registerCitizenRequest(data);
      const token = result.token || (result.session as any)?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutRequest();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { user: fetchedUser } = await getCurrentUserRequest();
      setUser(fetchedUser);
      localStorage.setItem('auth_user', JSON.stringify(fetchedUser));
    } catch {
      setUser(null);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
