import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { registerCitizenSchema, RegisterCitizenFormValues } from '../utils/auth.validators.js';
import { useRegister } from '../hooks/useRegister.js';

export interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

const inputClass = 'h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-sm text-slate-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600';
const labelClass = 'mb-1.5 block text-xs font-semibold text-stone-700';

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { pending, handleRegisterSubmit, confirmCode, editDetails, errorMessage, isSubmitting } = useRegister();
  const [code, setCode] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterCitizenFormValues>({
    resolver: zodResolver(registerCitizenSchema),
    defaultValues: { nombres: '', apellidos: '', ci: '', complemento: '', telefono: '', email: '', password: '', confirmPassword: '' },
  });

  const errorAlert = errorMessage && (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      {errorMessage}
    </div>
  );

  if (pending) {
    const simulatedCode = pending.challenge.codigoSimulado;
    return (
      <form
        className="w-full space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.length === 6 && !isSubmitting) void confirmCode(code);
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">Verifica tu correo</h2>
        <p className="text-sm text-stone-600">
          Introduce el código de 6 dígitos para completar tu registro.
          {!simulatedCode && <> Lo enviamos a <strong>{pending.values.email}</strong>.</>}
        </p>
        {errorAlert}
        <div>
          <label htmlFor="registro-otp" className={labelClass}>Código de verificación</label>
          <input
            id="registro-otp"
            className={inputClass}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          />
        </div>
        <button type="submit" disabled={isSubmitting || code.length !== 6} className="h-11 w-full rounded-lg bg-emerald-800 text-sm font-semibold text-white disabled:opacity-60">
          {isSubmitting ? 'Procesando...' : 'Confirmar e ingresar'}
        </button>
        <div className="flex justify-between gap-3 text-sm font-semibold text-emerald-700">
          <button type="button" disabled={isSubmitting} onClick={() => {
            setCode('');
            editDetails();
          }}>Editar datos</button>
          <button type="button" disabled={isSubmitting} onClick={() => {
            setCode('');
            void handleRegisterSubmit(pending.values);
          }}>Reenviar código</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleRegisterSubmit)} className="w-full space-y-3.5" noValidate>
      {errorAlert}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="registro-nombres" className={labelClass}>Nombres</label>
          <input id="registro-nombres" type="text" autoComplete="given-name" placeholder="Tus nombres" className={inputClass} aria-invalid={!!errors.nombres} aria-describedby={errors.nombres ? 'registro-nombres-error' : undefined} {...register('nombres')} />
          {errors.nombres && <p id="registro-nombres-error" className="mt-1 text-xs text-red-700">{errors.nombres.message}</p>}
        </div>
        <div>
          <label htmlFor="registro-apellidos" className={labelClass}>Apellidos</label>
          <input id="registro-apellidos" type="text" autoComplete="family-name" placeholder="Tus apellidos" className={inputClass} aria-invalid={!!errors.apellidos} aria-describedby={errors.apellidos ? 'registro-apellidos-error' : undefined} {...register('apellidos')} />
          {errors.apellidos && <p id="registro-apellidos-error" className="mt-1 text-xs text-red-700">{errors.apellidos.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 min-w-0">
          <label htmlFor="registro-ci" className={labelClass}>Cédula de Identidad (CI)</label>
          <input id="registro-ci" type="text" placeholder="Número de CI" className={inputClass} aria-invalid={!!errors.ci} aria-describedby={errors.ci ? 'registro-ci-error' : undefined} {...register('ci')} />
          {errors.ci && <p id="registro-ci-error" className="mt-1 text-xs text-red-700">{errors.ci.message}</p>}
        </div>
        <div className="min-w-0">
          <label htmlFor="registro-complemento" className={labelClass}>Complemento</label>
          <input id="registro-complemento" type="text" placeholder="Opcional" className={inputClass} aria-invalid={!!errors.complemento} aria-describedby={errors.complemento ? 'registro-complemento-error' : undefined} {...register('complemento')} />
          {errors.complemento && <p id="registro-complemento-error" className="mt-1 text-xs text-red-700">{errors.complemento.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="registro-telefono" className={labelClass}>Número de celular</label>
        <div className="flex items-center rounded-lg border border-stone-200 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600">
          <span className="pl-3 text-sm text-stone-500">+591</span>
          <input id="registro-telefono" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Número de 8 dígitos" className="h-[42px] w-full min-w-0 rounded-r-lg bg-transparent px-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none" aria-invalid={!!errors.telefono} aria-describedby={errors.telefono ? 'registro-telefono-error' : undefined} {...register('telefono')} />
        </div>
        {errors.telefono && <p id="registro-telefono-error" className="mt-1 text-xs text-red-700">{errors.telefono.message}</p>}
      </div>
      <div>
        <label htmlFor="registro-email" className={labelClass}>Correo electrónico</label>
        <input id="registro-email" type="email" autoComplete="email" placeholder="ej. nombre@correo.com" className={inputClass} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'registro-email-error' : undefined} {...register('email')} />
        {errors.email && <p id="registro-email-error" className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="registro-password" className={labelClass}>Contraseña</label>
          <div className="relative">
            <input id="registro-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={`${inputClass} pr-10`} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'registro-password-error' : undefined} {...register('password')} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} aria-pressed={showPassword} className="absolute right-3 top-3 rounded text-stone-400 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600">
              {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && <p id="registro-password-error" className="mt-1 text-xs text-red-700">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="registro-confirm-password" className={labelClass}>Confirmar contraseña</label>
          <input id="registro-confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repite la contraseña" className={inputClass} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'registro-confirm-password-error' : undefined} {...register('confirmPassword')} />
          {errors.confirmPassword && <p id="registro-confirm-password-error" className="mt-1 text-xs text-red-700">{errors.confirmPassword.message}</p>}
        </div>
      </div>
      <p className="text-xs leading-5 text-stone-500">Te enviaremos un código OTP a tu correo electrónico para verificar tu identidad.</p>
      <button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Enviando...' : 'Enviar código'}
        {!isSubmitting && <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />}
      </button>
      <p className="pt-1 text-center text-xs text-stone-500">
        ¿Ya tienes cuenta?{' '}
        {onSwitchToLogin ? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-emerald-700 hover:underline">Inicia sesión</button> : <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Inicia sesión</Link>}
      </p>
    </form>
  );
};
