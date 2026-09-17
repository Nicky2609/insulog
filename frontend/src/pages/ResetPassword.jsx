import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import {
  AuthShell,
  CampoTexto,
  BotonPrincipal,
  MensajeError,
  MensajeExito,
} from '../components/common/FormShell';

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
    <div className="min-h-screen flex flex-col bg-steel-900">
      <PublicHeader />

      <AuthShell
        eyebrow="Acceso"
        titulo="Crear nueva contraseña"
        descripcion="Elija una contraseña de al menos 6 caracteres."
        pie={
          <Link to="/ingresar" className="text-sm font-semibold text-blueprint-bright hover:underline">
            &larr; Volver a ingresar
          </Link>
        }
      >
        {done ? (
          <MensajeExito titulo="Contraseña actualizada">
            <p className="mb-6">Ya puede ingresar con su nueva contraseña.</p>
            <button
              onClick={() => navigate('/ingresar')}
              className="w-full bg-signal text-white font-semibold text-sm uppercase tracking-[0.1em] px-6 py-3.5 rounded-lg hover:bg-signal-dark transition-colors"
            >
              Ir a ingresar
            </button>
          </MensajeExito>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <CampoTexto
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              required
            />

            <CampoTexto
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />

            <MensajeError texto={error} />

            <BotonPrincipal loading={loading} textoCargando="Guardando...">
              Guardar contraseña
            </BotonPrincipal>
          </form>
        )}
      </AuthShell>

      <PublicFooter />
    </div>
  );
}