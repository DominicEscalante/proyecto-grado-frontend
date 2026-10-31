import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AppLogo, MountainBackground } from '../components/ui/index.js';
import { LoginForm, RegisterForm } from '../features/auth/index.js';

export interface LoginPageProps {
  initialMode?: 'login' | 'register';
}

const institutionalFooter = 'Gobierno Autónomo Municipal de La Paz · Dirección de Tecnologías de Información';

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/registro' || initialMode === 'register';

  useEffect(() => {
    if (!user) return;
    if (user.rol_id === 4) navigate('/admin/usuarios', { replace: true });
    else if (user.rol_id === 2 || user.rol_id === 3) navigate('/operador/emergencias', { replace: true });
    else navigate(user.identidad_verificada ? '/ciudadano/reportes' : '/verificar-identidad', { replace: true });
  }, [user, navigate]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white lg:grid lg:grid-cols-2">
      <section aria-label="Logo de AMPAR" className={`relative hidden min-h-screen items-center justify-center overflow-hidden bg-emerald-950 p-12 text-white lg:col-start-1 lg:row-start-1 lg:flex lg:transition-transform lg:duration-700 lg:ease-in-out motion-reduce:transition-none ${isRegister ? 'lg:translate-x-full' : 'lg:translate-x-0'}`}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-950 to-emergencia-darkest" />
        <MountainBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <AppLogo size={180} />
          <span className="text-3xl font-extrabold tracking-[0.16em] text-white">AMPAR</span>
          <p className="max-w-xs text-center text-sm leading-6 text-emerald-100/85">Coordinación de emergencias en tiempo real.</p>
        </div>
      </section>

      <section className={`flex min-h-screen min-w-0 flex-col justify-between overflow-hidden bg-white p-6 sm:p-12 lg:col-start-2 lg:row-start-1 lg:items-center lg:justify-center lg:py-8 lg:transition-transform lg:duration-700 lg:ease-in-out motion-reduce:transition-none ${isRegister ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}>
        <div className="flex justify-center pt-4 lg:hidden">
          <div className="flex flex-col items-center gap-2">
            <AppLogo size={52} color="#065f46" />
            <span className="text-xl font-extrabold tracking-[0.12em] text-emerald-950">AMPAR</span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-800">Sistema Integral de Emergencias</span>
          </div>
        </div>
        <div key={isRegister ? 'register' : 'login'} className={`mx-auto w-full max-w-md py-10 lg:animate-none lg:py-0 motion-reduce:animate-none ${isRegister ? 'animate-slideInRight' : 'animate-slideInLeft'}`}>
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-stone-900">{isRegister ? 'Registro ciudadano' : 'Iniciar Sesión'}</h1>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              {isRegister ? 'Crea tu cuenta para reportar y dar seguimiento a emergencias.' : 'Ingresa tus credenciales oficiales para acceder a la plataforma.'}
            </p>
          </div>
          {isRegister ? <RegisterForm onSwitchToLogin={() => navigate('/login')} /> : <LoginForm onSwitchToRegister={() => navigate('/registro')} />}
        </div>
        <p className="text-center text-[11px] leading-5 text-stone-400 lg:hidden">{institutionalFooter}</p>
      </section>
    </main>
  );
};
