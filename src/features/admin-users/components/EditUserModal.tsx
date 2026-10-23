import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { AdminUserItem, EditUserData } from '../types/admin-users.types.js';

interface EditUserModalProps {
  user: AdminUserItem | null;
  onClose: () => void;
  onSubmit: (id: string, data: EditUserData) => Promise<void>;
  loading: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSubmit,
  loading,
}) => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [institucion, setInstitucion] = useState<'POLICIA' | 'BOMBEROS' | ''>('');
  const [rango, setRango] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setNombres(user.nombres || '');
      setApellidos(user.apellidos || '');
      setTelefono(user.telefono || '');
      setInstitucion(user.institucion || '');
      setRango(user.rango || '');
      setFormError(null);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nombres.trim() || !apellidos.trim() || !telefono.trim()) {
      setFormError('Los campos de nombre y teléfono son requeridos.');
      return;
    }

    if (!/^[67]\d{7}$/.test(telefono.trim())) {
      setFormError('El número celular debe tener 8 dígitos numéricos iniciando con 6 o 7.');
      return;
    }

    const payload: EditUserData = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.trim(),
    };

    if (institucion) {
      payload.institucion = institucion as 'POLICIA' | 'BOMBEROS';
      payload.rol_id = institucion === 'POLICIA' ? 2 : 3;
    }

    if (rango.trim()) {
      payload.rango = rango.trim();
    }

    try {
      await onSubmit(user.id, payload);
    } catch (err: any) {
      setFormError(err.message || 'Error al actualizar usuario.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <h3 className="text-sm font-bold text-[#143601]">Editar Información</h3>
            <p className="text-xs text-stone-500 font-mono">CI: {user.ci} · {user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {formError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <ExclamationCircleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{formError}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Nombres</label>
              <input
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Apellidos</label>
              <input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Número Celular</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] font-mono focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
            />
          </div>

          {user.rol?.rolId !== 1 && user.rol?.rolId !== 4 && (
            <>
              <div>
                <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Institución</label>
                <select
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
                >
                  <option value="POLICIA">Policía Boliviana</option>
                  <option value="BOMBEROS">Cuerpo de Bomberos</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Rango Oficial</label>
                <input
                  type="text"
                  value={rango}
                  onChange={(e) => setRango(e.target.value)}
                  placeholder="Ej. Sargento, Teniente"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
                />
              </div>
            </>
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
              className="px-4 py-2 rounded-lg bg-[#245501] hover:bg-[#1a4301] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
