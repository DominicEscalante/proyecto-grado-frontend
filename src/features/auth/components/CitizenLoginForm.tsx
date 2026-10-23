import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormValues } from '../utils/auth.validators.js';
import { useLogin } from '../hooks/useLogin.js';

export interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const CitizenLoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { handleLoginSubmit, errorMessage, isSubmitting } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identificador: '',
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(handleLoginSubmit)} className="w-full space-y-7">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs backdrop-blur-md animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Input Identificador (Celular, CI o Correo) - Linea minimalista sobre fondo oscuro */}
      <div className="space-y-1.5">
        <div className="relative border-b border-white/25 focus-within:border-white transition-colors pb-2">
          <input
            id="identificador"
            type="text"
            placeholder="Número de celular, CI o correo"
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/50 focus:outline-none tracking-wide text-center"
            autoComplete="username"
            {...register('identificador')}
          />
        </div>
        {errors.identificador && (
          <p className="text-[11px] text-center font-medium text-red-300 pt-0.5">
            {errors.identificador.message}
          </p>
        )}
      </div>

      {/* Input Contrasena - Linea minimalista sobre fondo oscuro */}
      <div className="space-y-1.5">
        <div className="relative border-b border-white/25 focus-within:border-white transition-colors pb-2 flex items-center">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/50 focus:outline-none tracking-wide text-center pl-7 pr-7"
            autoComplete="current-password"
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 text-white/50 hover:text-white transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] text-center font-medium text-red-300 pt-0.5">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Boton Pildora Blanco Prominente (Identico al diseno de referencia) */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-full bg-white text-[#143601] text-base font-semibold tracking-wide shadow-2xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 text-[#143601]">
              <svg
                className="animate-spin h-5 w-5 text-[#143601]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Verificando...</span>
            </span>
          ) : (
            'Login'
          )}
        </button>
      </div>

      {/* Enlaces minimalistas centrados */}
      <div className="pt-2 flex flex-col items-center gap-3 text-center text-xs">
        <span className="text-white/60 hover:text-white transition-colors cursor-pointer">
          ¿Olvidaste tu contraseña?
        </span>

        {onSwitchToRegister ? (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-white/80 hover:text-white font-medium transition-colors pt-2 focus:outline-none"
          >
            ¿No tienes cuenta? <span className="underline font-bold text-white">Regístrate</span>
          </button>
        ) : (
          <Link
            to="/registro"
            className="text-white/80 hover:text-white font-medium transition-colors pt-2"
          >
            ¿No tienes cuenta? <span className="underline font-bold text-white">Regístrate</span>
          </Link>
        )}
      </div>
    </form>
  );
};

export const LoginForm = CitizenLoginForm;
