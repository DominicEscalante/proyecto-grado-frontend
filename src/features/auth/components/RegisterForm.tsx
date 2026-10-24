import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
  registerCitizenSchema,
  RegisterCitizenFormValues,
} from '../utils/auth.validators.js';
import { useRegister } from '../hooks/useRegister.js';

export interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { handleRegisterSubmit, errorMessage, isSubmitting } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCitizenFormValues>({
    resolver: zodResolver(registerCitizenSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      ci: '',
      complemento: '',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(handleRegisterSubmit)} className="w-full space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs backdrop-blur-md animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Nombres y Apellidos */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="border-b border-white/25 focus-within:border-white transition-colors pb-1.5">
            <input
              type="text"
              placeholder="Nombres"
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
              {...register('nombres')}
            />
          </div>
          {errors.nombres && (
            <p className="text-[10px] text-red-300">{errors.nombres.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="border-b border-white/25 focus-within:border-white transition-colors pb-1.5">
            <input
              type="text"
              placeholder="Apellidos"
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
              {...register('apellidos')}
            />
          </div>
          {errors.apellidos && (
            <p className="text-[10px] text-red-300">{errors.apellidos.message}</p>
          )}
        </div>
      </div>

      {/* CI y Complemento */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1">
          <div className="border-b border-white/25 focus-within:border-white transition-colors pb-1.5">
            <input
              type="text"
              placeholder="Carnet de Identidad"
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
              {...register('ci')}
            />
          </div>
          {errors.ci && (
            <p className="text-[10px] text-red-300">{errors.ci.message}</p>
          )}
        </div>

        <div className="col-span-1 space-y-1">
          <div className="border-b border-white/25 focus-within:border-white transition-colors pb-1.5">
            <input
              type="text"
              placeholder="Compl."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none text-center"
              {...register('complemento')}
            />
          </div>
          {errors.complemento && (
            <p className="text-[10px] text-red-300">{errors.complemento.message}</p>
          )}
        </div>
      </div>

      {/* Celular */}
      <div className="space-y-1">
        <div className="flex items-center border-b border-white/25 focus-within:border-white transition-colors pb-1.5">
          <span className="text-xs text-white/60 mr-2 font-mono">+591</span>
          <input
            type="text"
            placeholder="Número Celular (8 dígitos)"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
            {...register('telefono')}
          />
        </div>
        {errors.telefono && (
          <p className="text-[10px] text-red-300">{errors.telefono.message}</p>
        )}
      </div>

      {/* Correo Electrónico */}
      <div className="space-y-1">
        <div className="border-b border-white/25 focus-within:border-white transition-colors pb-1.5">
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-[10px] text-red-300">{errors.email.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div className="space-y-1">
        <div className="relative border-b border-white/25 focus-within:border-white transition-colors pb-1.5 flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña (mínimo 8 caracteres)"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none pr-7"
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 text-white/50 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[10px] text-red-300">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div className="space-y-1">
        <div className="border-b border-white/25 focus-within:border-white transition-colors pb-1.5">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmar Contraseña"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-[10px] text-red-300">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Aviso de verificacion OTP */}
      <p className="text-[11px] text-white/60 text-center leading-relaxed">
        Te enviaremos un código OTP de 6 dígitos a tu correo electrónico para verificar tu identidad.
      </p>

      {/* Boton Pildora Blanco */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-full bg-white text-[#143601] text-sm font-semibold tracking-wide shadow-2xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 select-none"
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Cuenta'}
        </button>
      </div>

      <div className="pt-1 text-center text-xs">
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-white/80 hover:text-white font-medium transition-colors focus:outline-none"
          >
            ¿Ya tienes cuenta? <span className="underline font-bold text-white">Inicia sesión</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="text-white/80 hover:text-white font-medium transition-colors"
          >
            ¿Ya tienes cuenta? <span className="underline font-bold text-white">Inicia sesión</span>
          </Link>
        )}
      </div>
    </form>
  );
};
