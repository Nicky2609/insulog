import { useState } from 'react';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';
import apiClient from '../../lib/api';

const SERVICE_TYPES = ['Construccion', 'Suministros', 'Logistica', 'Otro'];

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  company_name: '',
  service_type: SERVICE_TYPES[0],
  description: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      await apiClient.post('/quotes/form', form);
      setStatus('sent');
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'No fue posible enviar el formulario. Intente de nuevo.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <section className="max-w-2xl mx-auto px-6 py-16 w-full flex-1">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">Formulario directo</p>
        <h1 className="font-display text-3xl md:text-4xl text-steel-900 mb-3">Cuentenos que necesita</h1>
        <p className="text-steel-600 mb-10">
          Un asesor tecnico revisa su solicitud y lo contacta por telefono o correo en menos de un dia habil.
        </p>

        {status === 'sent' ? (
          <div className="border border-blueprint bg-blueprint-light rounded-xl p-6">
            <p className="font-display text-xl text-steel-900 mb-2">Solicitud enviada</p>
            <p className="text-steel-700 text-sm">
              Gracias, ya recibimos su informacion. Nuestro equipo se pondra en contacto pronto.
            </p>
          </div>
        ) : (
          <div className="panel-card p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Nombre completo" required>
                  <input
                    required
                    type="text"
                    value={form.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Empresa (opcional)">
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Correo electronico" required>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Telefono" required>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Tipo de servicio">
                <select
                  value={form.service_type}
                  onChange={(e) => updateField('service_type', e.target.value)}
                  className="input"
                >
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Describa su proyecto" required>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="input resize-none"
                  placeholder="Ubicacion, alcance, plazos estimados, materiales que necesita..."
                />
              </Field>

              {status === 'error' && <p className="text-sm text-signal-dark">{errorMessage}</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors disabled:opacity-60"
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        )}
      </section>

      <PublicFooter />

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(27,42,56,0.15);
          border-radius: 0.5rem;
          padding: 0.65rem 0.85rem;
          background: white;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
        {label} {required && <span className="text-signal">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}