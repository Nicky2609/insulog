import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import { AuthShell, CampoTexto, BotonPrincipal, MensajeError } from '../components/common/FormShell';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/panel', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'No fue posible ingresar. Revise sus datos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-steel-900">
      <PublicHeader />

      <AuthShell
        eyebrow="Acceso"
        titulo="Ingresar al panel"
        descripcion="Uso exclusivo del personal autorizado de Insulog S.A.S."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <CampoTexto
            label="Correo electronico"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="username"
            required
          />

          <CampoTexto
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />

          <MensajeError texto={error} />

          <div className="flex justify-end">
            <Link
              to="/olvide-password"
              className="text-xs font-semibold text-blueprint hover:underline"
            >
              ¿Olvido su contraseña?
            </Link>
          </div>

          <BotonPrincipal loading={loading} textoCargando="Ingresando...">
            Ingresar
          </BotonPrincipal>
        </form>
      </AuthShell>

      <PublicFooter />
    </div>
  );
}