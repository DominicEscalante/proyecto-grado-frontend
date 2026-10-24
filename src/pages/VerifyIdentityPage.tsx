import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AppLogo, MountainBackground } from '../components/ui/index.js';
import { apiClient, handleApiError } from '../api/client.js';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw, LogOut, Mail, Info } from 'lucide-react';

export const VerifyIdentityPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Manejo del temporizador de espera para reenviar
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Solicitar envio de codigo OTP por correo (HU-03)
  const handleSolicitarCodigo = async () => {
    if (cooldown > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRequestingOtp(true);
    try {
      const response = await apiClient.post<{ data: { codigoSimulado?: string } }>(
        '/api/auth/solicitar-verificacion'
      );
      setSuccessMessage('Se ha enviado un nuevo código de 6 dígitos a tu correo electrónico.');
      setCooldown(60); // 60 segundos de espera para proteger cuota de envio

      if (response.data?.data?.codigoSimulado) {
        setSimulatedCode(response.data.data.codigoSimulado);
      }
    } catch (err) {
      setErrorMessage(handleApiError(err));
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Validar codigo OTP (HU-03)
  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setErrorMessage('El código debe contener exactamente 6 dígitos numéricos.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/auth/verificar-identidad', { codigo: code.trim() });
      await refreshUser();
      navigate('/ciudadano/reportes');
    } catch (err) {
      setErrorMessage(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d2200] flex items-center justify-center p-0 sm:p-6 select-none">
      <div
        className="relative w-full sm:max-w-[420px] min-h-screen sm:min-h-[740px] sm:max-h-[820px] sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] sm:border sm:border-white/10 flex flex-col justify-between items-center px-7 sm:px-8 py-8 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #143601 0%, #1a4301 45%, #245501 85%, #143601 100%)',
        }}
      >
        <MountainBackground />

        {/* Cabecera */}
        <div className="relative z-10 w-full flex flex-col items-center pt-2">
          <AppLogo size={64} showText={true} title="AMPAR" subtitle="Validación de Identidad (HU-03)" />
        </div>

        {/* Contenido Central */}
        <div className="relative z-10 w-full my-auto py-4 space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-base font-bold text-white">Verificación de Cuenta</h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Para garantizar la autenticidad de tus reportes, ingresa el código de 6 dígitos enviado a tu correo:
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/15 text-xs text-emerald-200 font-medium">
              <Mail className="w-3.5 h-3.5 text-emerald-300" />
              <span>{user?.email || 'correo registrado'}</span>
            </div>
            {user?.telefono && (
              <p className="text-[11px] text-white/50">
                Asociado al celular: +591 {user.telefono} · CI: {user.ci || '—'}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs backdrop-blur-md animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs backdrop-blur-md animate-fadeIn">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {simulatedCode && (
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] backdrop-blur-md">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>Modo Pruebas / Dev: Código emitido </span>
                <button
                  type="button"
                  onClick={() => setCode(simulatedCode)}
                  className="font-mono font-bold underline text-white hover:text-amber-300"
                >
                  {simulatedCode} (autocompletar)
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleVerificarCodigo} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative border-b border-white/25 focus-within:border-white transition-colors pb-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent text-3xl font-mono text-center tracking-[0.45em] text-white placeholder-white/30 focus:outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-center text-white/50">
                El código expira en 15 minutos
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="w-full py-4 px-6 rounded-full bg-white text-[#143601] text-sm font-semibold tracking-wide shadow-2xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 select-none"
            >
              {isSubmitting ? 'Validando...' : 'Confirmar Identidad'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={handleSolicitarCodigo}
              disabled={isRequestingOtp || cooldown > 0}
              className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRequestingOtp ? 'animate-spin' : ''}`} />
              <span>
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar Código'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/ciudadano/reportes')}
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              Omitir por ahora
            </button>
          </div>
        </div>

        {/* Pie de Pantalla */}
        <div className="relative z-10 w-full flex items-center justify-between pt-2">
          <span className="text-[10px] text-white/40 uppercase">GAMLP · La Paz</span>
          <button
            type="button"
            onClick={logout}
            className="text-[11px] text-white/60 hover:text-white inline-flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
