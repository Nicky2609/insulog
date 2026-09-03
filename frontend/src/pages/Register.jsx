import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';

const EMPTY_FORM = { full_name: '', email: '', phone: '', company_name: '', password: '' };

export default function Register() {
  const { signUpAsQuoter } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUpAsQuoter(form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No fue posible crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <section className="max-w-md mx-auto px-6 py-20 w-full flex-1 text-center">
          <div className="panel-card p-8">
            <p className="font-display text-2xl text-steel-900 mb-3">Cuenta creada</p>
            <p className="text-steel-600 mb-6">
              Su cuenta fue creada correctamente. Ya puede ingresar con su correo y contraseña.
            </p>
            <button
              onClick={() => navigate('/ingresar')}
              className="bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors"
            >
              Ir a ingresar
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <section className="max-w-md mx-auto px-6 py-20 w-full flex-1">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">Cuenta de cotizante</p>
        <h1 className="font-display text-3xl text-steel-900 mb-8">Cree su cuenta</h1>

        <div className="panel-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField label="Nombre completo" value={form.full_name} onChange={(v) => updateField('full_name', v)} />
            <TextField label="Empresa (opcional)" value={form.company_name} onChange={(v) => updateField('company_name', v)} required={false} />
            <TextField label="Telefono" value={form.phone} onChange={(v) => updateField('phone', v)} />
            <TextField label="Correo electronico" type="email" value={form.email} onChange={(v) => updateField('email', v)} />
            <TextField label="Contraseña" type="password" value={form.password} onChange={(v) => updateField('password', v)} />

            {error && <p className="text-sm text-signal-dark">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-steel-600">
          ¿Ya tiene cuenta?{' '}
          <Link to="/ingresar" className="text-blueprint font-semibold hover:underline">
            Ingrese aqui
          </Link>
        </p>
      </section>
    </div>
  );
}

function TextField({ label, value, onChange, type = 'text', required = true }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
      />
    </label>
  );
}