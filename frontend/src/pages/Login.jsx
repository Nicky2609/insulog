import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || '/panel';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <section className="max-w-md mx-auto px-6 py-20 w-full flex-1">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">Acceso</p>
        <h1 className="font-display text-3xl text-steel-900 mb-8">Ingresar al panel</h1>

        <div className="panel-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
                Correo electronico
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">Contraseña</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
              />
            </label>

            {error && <p className="text-sm text-signal-dark">{error}</p>}

            <div className="flex justify-end">
              <Link to="/olvide-password" className="text-xs text-blueprint font-semibold hover:underline">
                ¿Olvido su contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}