import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AppLogo, MountainBackground } from '../components/ui/index.js';
import { LoginForm, RegisterForm } from '../features/auth/index.js';

export interface LoginPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirigir si el usuario ya cuenta con sesion activa
  useEffect(() => {
    if (user) {
      if (user.rol_id === 4) {
        navigate('/admin/usuarios', { replace: true });
      } else if (user.rol_id === 2 || user.rol_id === 3) {
        navigate('/operador/emergencias', { replace: true });
      } else {
        if (!user.identidad_verificada) {
          navigate('/verificar-identidad', { replace: true });
        } else {
          navigate('/ciudadano/reportes', { replace: true });
        }
      }
    }
  }, [user, navigate]);

  // Sincronizar estado con la ruta o valor inicial
  const currentPathMode = location.pathname === '/registro' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode || currentPathMode);
  const [direction, setDirection] = useState<'toRegister' | 'toLogin'>('toRegister');

  // Detectar cambios en la URL (por ejemplo botones atras / adelante del navegador)
  useEffect(() => {
    if (location.pathname === '/registro' && mode !== 'register') {
      setDirection('toRegister');
      setMode('register');
    } else if (location.pathname === '/login' && mode !== 'login') {
      setDirection('toLogin');
      setMode('login');
    }
  }, [location.pathname, mode]);

  const handleSwitchToRegister = () => {
    setDirection('toRegister');
    setMode('register');
    navigate('/registro');
  };

  const handleSwitchToLogin = () => {
    setDirection('toLogin');
    setMode('login');
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-[#0d2200] flex items-center justify-center p-0 sm:p-6 select-none">
      {/* Contenedor estilo Pantalla Movil (Referencia de diseno) */}
      <div
        className="relative w-full sm:max-w-[410px] min-h-screen sm:min-h-[740px] sm:max-h-[840px] sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] sm:border sm:border-white/10 flex flex-col justify-between items-center px-7 sm:px-8 py-8 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #143601 0%, #1a4301 45%, #245501 85%, #143601 100%)',
        }}
      >
        {/* Capas de relieve de montanas andinas en degradado de 6 colores */}
        <MountainBackground />

        {/* 1. Cabecera con Logotipo Oficial AMPAR */}
        <div className="relative z-10 w-full flex flex-col items-center pt-2 transition-all duration-300">
          <AppLogo
            size={mode === 'login' ? 76 : 56}
            showText={true}
            title="AMPAR"
            subtitle={
              mode === 'login'
                ? 'Sistema de Respuesta a Emergencias'
                : 'Registro de Usuario'
            }
          />
        </div>

        {/* 2. Contenedor Dinamico con Animacion de Transicion */}
        <div className="relative z-10 w-full my-auto py-3">
          {mode === 'login' ? (
            <div
              key="login"
              className={
                direction === 'toLogin'
                  ? 'animate-slideInLeft w-full'
                  : 'animate-fadeIn w-full'
              }
            >
              <LoginForm onSwitchToRegister={handleSwitchToRegister} />
            </div>
          ) : (
            <div
              key="register"
              className="animate-slideInRight w-full max-h-[500px] overflow-y-auto custom-scrollbar pr-1"
            >
              <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
            </div>
          )}
        </div>

        {/* 3. Pie de Pantalla Oficial */}
        <div className="relative z-10 w-full text-center pt-1">
          <p className="text-[10px] text-white/40 tracking-wider uppercase font-medium">
            Gobierno Autónomo Municipal de La Paz
          </p>
        </div>
      </div>
    </div>
  );
};
