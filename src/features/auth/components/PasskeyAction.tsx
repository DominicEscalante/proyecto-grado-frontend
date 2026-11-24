import { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.js';

export function PasskeyAction({ mode }: { mode: 'login' | 'enroll' }) {
  const { loginWithPasskey } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  if (!window.isSecureContext || !window.PublicKeyCredential) return null;

  const handleClick = async () => {
    setBusy(true);
    setMessage('');
    setFailed(false);
    try {
      if (mode === 'login') {
        await loginWithPasskey();
      } else {
        const { enrollPasskey } = await import('../api/passkey.api.js');
        await enrollPasskey();
        setMessage('Clave de acceso registrada.');
      }
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : 'No se pudo usar la clave de acceso.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleClick()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
      >
        <Fingerprint className="h-5 w-5" aria-hidden="true" />
        {busy ? 'Esperando confirmación…' : mode === 'login' ? 'Entrar con clave de acceso' : 'Registrar clave de acceso'}
      </button>
      {message && <p role={failed ? 'alert' : 'status'} className={failed ? 'text-sm text-red-700' : 'text-sm text-emerald-800'}>{message}</p>}
    </div>
  );
}
