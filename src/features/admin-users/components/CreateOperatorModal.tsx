import React, { useState } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  FireIcon,
  ExclamationCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { CreateOperatorData } from '../types/admin-users.types.js';

interface CreateOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOperatorData) => Promise<void>;
  loading: boolean;
}

export const CreateOperatorModal: React.FC<CreateOperatorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [institucion, setInstitucion] = useState<'POLICIA' | 'BOMBEROS'>('POLICIA');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [ci, setCi] = useState('');
  const [complemento, setComplemento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [rango, setRango] = useState('');
  const [password, setPassword] = useState('Pa$$w0rd');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !nombres.trim() ||
      !apellidos.trim() ||
      !ci.trim() ||
      !telefono.trim() ||
      !email.trim() ||
      !rango.trim() ||
      !password
    ) {
      setFormError('Todos los campos son requeridos.');
      return;
    }

    if (!/^[67]\d{7}$/.test(telefono.trim())) {
      setFormError(
        'El número celular debe ser boliviano válido de 8 dígitos (iniciando con 6 o 7).'
      );
      return;
    }

    if (password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      await onSubmit({
        institucion,
        rol_id: institucion === 'POLICIA' ? 2 : 3,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        ci: ci.trim(),
        complemento: complemento.trim() || undefined,
        telefono: telefono.trim(),
        email: email.trim().toLowerCase(),
        rango: rango.trim(),
        password,
      });
    } catch (err: any) {
      setFormError(err.message || 'Error al registrar operador.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <h3 className="text-sm font-bold text-[#143601]">Registrar Nuevo Operador</h3>
            <p className="text-xs text-stone-500">Alta de cuenta institucional para despacho operativo</p>
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
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar text-xs"
        >
          {formError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <ExclamationCircleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{formError}</div>
            </div>
          )}

          {/* Selector de Institución */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1.5 font-mono text-[11px] uppercase">
              Institución Operativa
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInstitucion('POLICIA')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all ${
                  institucion === 'POLICIA'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-[#F8FAFC] border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="text-left">
                  <span className="block text-xs font-bold text-[#143601]">Policía Boliviana</span>
                  <span className="text-[10px] text-stone-500 font-mono">Rol: Operador 110</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInstitucion('BOMBEROS')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all ${
                  institucion === 'BOMBEROS'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-xs'
                    : 'bg-[#F8FAFC] border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <FireIcon className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-left">
                  <span className="block text-xs font-bold text-[#143601]">Cuerpo de Bomberos</span>
                  <span className="text-[10px] text-stone-500 font-mono">Rol: Operador 119</span>
                </div>
              </button>
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Nombres</label>
              <input
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. Pedro"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Apellidos</label>
              <input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Mamani"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
          </div>

          {/* Documento CI y Complemento */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Carnet de Identidad (CI)</label>
              <input
                type="text"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ej. 7654321"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 font-mono focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Compl.</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="1A"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 font-mono text-center focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
          </div>

          {/* Celular y Rango */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Celular (8 dígitos)</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="71234567"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 font-mono focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Rango Oficial</label>
              <input
                type="text"
                value={rango}
                onChange={(e) => setRango(e.target.value)}
                placeholder="Ej. Sargento / Teniente"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
              />
            </div>
          </div>

          {/* Correo Institucional */}
          <div>
            <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Correo Institucional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={institucion === 'POLICIA' ? 'operador@pol.com' : 'operador@bom.com'}
              className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] placeholder-stone-400 font-mono focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
            />
          </div>

          {/* Contraseña Inicial */}
          <div>
            <label className="block text-stone-700 font-medium mb-1 font-mono text-[11px]">Contraseña de Acceso</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-stone-300 text-[#143601] font-mono focus:outline-none focus:border-[#245501] focus:ring-1 focus:ring-[#245501] transition-colors"
            />
            <span className="text-[10px] text-stone-500 pt-1 block font-mono">
              Por defecto: Pa$$w0rd (el operador puede actualizarla tras su primer ingreso).
            </span>
          </div>

          {/* Botones */}
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
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Crear Cuenta de Operador</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
