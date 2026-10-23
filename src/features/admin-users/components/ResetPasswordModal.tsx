import React, { useState } from 'react';
import {
  KeyIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { AdminUserItem } from '../types/admin-users.types.js';

interface ResetPasswordModalProps {
  user: AdminUserItem | null;
  onClose: () => void;
  onSubmit: (id: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  user,
  onClose,
  onSubmit,
  loading,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setConfirmPassword(result);
    setError(null);
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Debes ingresar la nueva contraseña.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await onSubmit(user.id, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#245501]/10 border border-[#245501]/20 flex items-center justify-center text-[#245501]">
              <KeyIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#143601]">Restablecer Credenciales</h3>
              <p className="text-[11px] text-stone-500 truncate max-w-[240px]">
                {user.name || `${user.nombres} ${user.apellidos}`} ({user.email})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-medium">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-stone-200 text-xs text-stone-600 space-y-1">
            <p className="font-bold text-[#143601]">Nota de Seguridad Institucional</p>
            <p className="text-[11px]">
              El usuario deberá utilizar esta nueva credencial en su próximo inicio de sesión.
            </p>
          </div>

          {/* Generador rápido */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-stone-700 font-medium">Contraseña:</span>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 text-[#245501] text-xs font-semibold transition-colors"
            >
              <ArrowPathIcon className="w-3 h-3" />
              <span>Generar Temporal</span>
            </button>
          </div>

          {/* Campo: Nueva Contraseña */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-700 font-mono">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-xs text-[#143601] placeholder-stone-400 font-mono focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors pr-9 font-semibold"
              />
              {password && (
                <button
                  type="button"
                  onClick={copyPassword}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#143601]"
                  title="Copiar contraseña"
                >
                  {copied ? (
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Campo: Confirmar Contraseña */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-700 font-mono">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Reescribe la contraseña..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-xs text-[#143601] placeholder-stone-400 font-mono focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors font-semibold"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg border border-stone-300 text-xs text-stone-700 hover:bg-stone-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#245501] hover:bg-[#1a4301] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <KeyIcon className="w-3.5 h-3.5" />
                  <span>Actualizar Contraseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
