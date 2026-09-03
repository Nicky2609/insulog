import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';

export default function ResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'El enlace no es valido o ya expiro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <section className="max-w-md mx-auto px-6 py-20 w-full flex-1">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">Acceso</p>
        <h1 className="font-display text-3xl text-steel-900 mb-8">Crear nueva contraseña</h1>

        <div className="panel-card p-6">
          {done ? (
            <div>
              <p className="font-display text-xl text-steel-900 mb-2">Contraseña actualizada</p>
              <p className="text-sm text-steel-600 mb-6">Ya puede ingresar con su nueva contraseña.</p>
              <button
                onClick={() => navigate('/ingresar')}
                className="w-full bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors"
              >
                Ir a ingresar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
                  Nueva contraseña
                </span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
                  Confirmar contraseña
                </span>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
                />
              </label>

              {error && <p className="text-sm text-signal-dark">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-sm text-steel-600">
          <Link to="/ingresar" className="text-blueprint font-semibold hover:underline">
            Volver a ingresar
          </Link>
        </p>
      </section>
    </div>
  );
}