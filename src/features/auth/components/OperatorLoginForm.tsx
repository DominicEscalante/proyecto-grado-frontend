import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormValues } from '../utils/auth.validators.js';
import { useLogin } from '../hooks/useLogin.js';

export const OperatorLoginForm: React.FC = () => {
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
    <form onSubmit={handleSubmit((values) => handleLoginSubmit(values))} className="space-y-5">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Input Credencial Institucional */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-white/70" />
          <span>Credencial (CI o Correo Oficial)</span>
        </label>
        <div className="relative border-b border-white/30 focus-within:border-white transition-colors pb-1.5">
          <input
            type="text"
            placeholder="Ej. 7654321 o sargento@policia.gob.bo"
            className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
            autoComplete="username"
            {...register('identificador')}
          />
        </div>
        {errors.identificador && (
          <p className="text-[10px] text-red-300">{errors.identificador.message}</p>
        )}
      </div>

      {/* Input Clave */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-white/70" />
          <span>Clave de Operador</span>
        </label>
        <div className="relative border-b border-white/30 focus-within:border-white transition-colors pb-1.5 flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingrese su clave institucional"
            className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none pr-7"
            autoComplete="current-password"
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 text-white/50 hover:text-white transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[10px] text-red-300">{errors.password.message}</p>
        )}
      </div>

      {/* Boton Pildora Blanco */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-full bg-white text-[#143601] text-sm font-bold tracking-wide shadow-xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 select-none"
        >
          {isSubmitting ? 'Verificando credenciales...' : 'Ingresar a Consola'}
        </button>
      </div>

      <p className="text-center text-[11px] text-white/50 pt-1">
        Policía Boliviana · Bomberos · Administración Central
      </p>
    </form>
  );
};
