import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sileo } from 'sileo';
import { apiClient, handleApiError } from '../api/client.js';
import { AppLogo } from '../components/ui/AppLogo.js';
import { useAuth } from '../context/AuthContext.js';
import { nuevaPasswordSchema, passwordHint } from '../features/auth/utils/password.schema.js';

export function OperatorInitialPasswordPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const actual = String(form.get('actual') ?? '');
    const nueva = String(form.get('nueva') ?? '');
    const validation = nuevaPasswordSchema.safeParse(nueva);
    if (!validation.success) return setError(passwordHint);
    if (actual === nueva) return setError('Elige una contraseña diferente a la temporal.');
    if (nueva !== form.get('confirmacion')) return setError('Las contraseñas nuevas no coinciden.');

    setError('');
    setSaving(true);
    try {
      await apiClient.post('/api/auth/password-inicial', { actual, nueva });
      sileo.success({ title: 'Contraseña actualizada', description: 'Inicia sesión con tu nueva contraseña.' });
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      setError(handleApiError(error));
      setSaving(false);
    }
  }

  const inputClass = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-emerald-800';

  return (
    <main className="grid min-h-dvh place-items-center bg-stone-100 p-4">
      <section className="w-full max-w-md space-y-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <AppLogo size={30} />
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-stone-900">Cambia tu contraseña temporal</h1>
          <p className="text-sm text-stone-600">Crea tu propia contraseña antes de acceder al panel de operador.</p>
        </div>
        <form onSubmit={submit} className="grid gap-4 text-sm">
          <label className="font-medium">Contraseña temporal
            <input className={inputClass} name="actual" type="password" autoComplete="current-password" required maxLength={128} />
          </label>
          <label className="font-medium">Nueva contraseña
            <input className={inputClass} name="nueva" type="password" autoComplete="new-password" aria-describedby="initial-password-hint" required minLength={15} maxLength={128} />
            <span id="initial-password-hint" className="mt-1 block text-xs font-normal text-stone-600">{passwordHint}</span>
          </label>
          <label className="font-medium">Confirma la nueva contraseña
            <input className={inputClass} name="confirmacion" type="password" autoComplete="new-password" required maxLength={128} />
          </label>
          {error && <p role="alert" className="rounded-md bg-rose-50 p-2 text-rose-800">{error}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-[#143601] px-4 py-2.5 font-semibold text-white disabled:opacity-60">
            {saving ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
          <button type="button" disabled={saving} onClick={() => void logout()} className="justify-self-center px-3 py-1 text-stone-700 underline">Cerrar sesión</button>
        </form>
      </section>
    </main>
  );
}
