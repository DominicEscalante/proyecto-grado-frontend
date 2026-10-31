import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { loginSchema, LoginFormValues } from '../utils/auth.validators.js';
import { useLogin } from '../hooks/useLogin.js';

export interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const CitizenLoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false);
  const { handleLoginSubmit, errorMessage, isSubmitting } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identificador: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit((values) => handleLoginSubmit(values, rememberSession))} className="w-full space-y-5" noValidate>
      {errorMessage && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label htmlFor="identificador" className="mb-1.5 block text-xs font-semibold text-stone-700">Correo institucional o Cédula de Identidad (CI)</label>
        <div className="relative">
          <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-3 h-5 w-5 text-stone-400" aria-hidden="true" />
          <input id="identificador" type="text" autoComplete="username" placeholder="ej. operador@policia.bo o CI"
            aria-invalid={!!errors.identificador} aria-describedby={errors.identificador ? 'identificador-error' : undefined}
            className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-11 pr-3 text-sm text-slate-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            {...register('identificador')} />
        </div>
        {errors.identificador && <p id="identificador-error" className="mt-1.5 text-xs text-red-700">{errors.identificador.message}</p>}
      </div>

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="password" className="text-xs font-semibold text-stone-700">Contraseña</label>
          <button type="button" onClick={() => setShowRecoveryHelp((visible) => !visible)} aria-expanded={showRecoveryHelp} aria-controls="recovery-help" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline">¿Olvidaste tu contraseña?</button>
        </div>
        {showRecoveryHelp && <p id="recovery-help" className="mb-2 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">Solicita el restablecimiento de tu contraseña al Administrador de Red de tu institución.</p>}
        <div className="relative">
          <LockClosedIcon className="pointer-events-none absolute left-3.5 top-3 h-5 w-5 text-stone-400" aria-hidden="true" />
          <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Ingresa tu contraseña"
            aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined}
            className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-11 pr-11 text-sm text-slate-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            {...register('password')} />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}
            className="absolute right-3 top-2.5 cursor-pointer rounded p-0.5 text-stone-400 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600">
            {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {errors.password && <p id="password-error" className="mt-1.5 text-xs text-red-700">{errors.password.message}</p>}
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-xs text-stone-600">
        <input type="checkbox" checked={rememberSession} onChange={(event) => setRememberSession(event.target.checked)}
          className="h-4 w-4 rounded border-stone-300 text-emerald-800 focus:ring-emerald-600" />
        Mantener sesión iniciada en este equipo
      </label>

      <button type="submit" disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
        <span>{isSubmitting ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
        {!isSubmitting && <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />}
      </button>

      <p className="pt-3 text-center text-xs leading-relaxed text-stone-500">
        ¿No tienes una cuenta de operador? Contacta al Administrador de Red o{' '}
        {onSwitchToRegister ? (
          <button type="button" onClick={onSwitchToRegister} className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">Regístrate como ciudadano.</button>
        ) : (
          <Link to="/registro" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">Regístrate como ciudadano.</Link>
        )}
      </p>
    </form>
  );
};

export const LoginForm = CitizenLoginForm;
