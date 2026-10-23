import React, { useState } from 'react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { AdminUserItem } from '../types/admin-users.types.js';

interface ToggleStatusModalProps {
  user: AdminUserItem | null;
  onClose: () => void;
  onSubmit: (id: string, newStatus: boolean, motivo?: string) => Promise<void>;
  loading: boolean;
}

export const ToggleStatusModal: React.FC<ToggleStatusModalProps> = ({
  user,
  onClose,
  onSubmit,
  loading,
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const willSuspend = user.estadoCuenta;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (willSuspend && motivo.trim().length < 5) {
      setError('Por favor indica un motivo de al menos 5 caracteres para la suspensión del acceso.');
      return;
    }

    try {
      await onSubmit(user.id, !willSuspend, motivo.trim() || undefined);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            {willSuspend ? (
              <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                <ExclamationTriangleIcon className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircleIcon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-[#143601]">
                {willSuspend ? 'Suspender Acceso' : 'Reactivar Cuenta'}
              </h3>
              <p className="text-[11px] text-stone-500 truncate max-w-[240px]">
                {user.name} ({user.email})
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

        <form onSubmit={handleConfirm} className="p-5 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <ExclamationCircleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <p className="text-stone-600 leading-relaxed text-xs">
            {willSuspend ? (
              <>
                ¿Estás seguro de que deseas suspender la cuenta de{' '}
                <strong className="text-[#143601]">{user.name}</strong>? El usuario no podrá iniciar sesión en la plataforma mientras se encuentre suspendido.
              </>
            ) : (
              <>
                ¿Deseas reactivar la cuenta de <strong className="text-[#143601]">{user.name}</strong>? El usuario podrá volver a ingresar al sistema con sus credenciales habituales.
              </>
            )}
          </p>

          {willSuspend && (
            <div>
              <label className="block text-stone-700 mb-1 font-mono text-[11px] font-medium">
                Motivo de la suspensión (Auditoría obligatoria)
              </label>
              <textarea
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Indica la razón institucional para suspender este acceso..."
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
              />
            </div>
          )}

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 ${
                willSuspend
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#245501] hover:bg-[#1a4301]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : willSuspend ? (
                <>
                  <NoSymbolIcon className="w-3.5 h-3.5" />
                  <span>Confirmar Suspensión</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  <span>Confirmar Reactivación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
