import { useState } from 'react';
import apiClient from '../../lib/api';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';
import {
  AuthShell,
  CampoTexto,
  CampoSelect,
  CampoTextarea,
  BotonPrincipal,
  MensajeError,
  MensajeExito,
} from '../../components/common/FormShell';

const FORM_VACIO = {
  full_name: '',
  company_name: '',
  email: '',
  phone: '',
  service_type: '',
  description: '',
};

/* Las opciones corresponden a las tres lineas del objeto social
   registrado de la empresa. */
const TIPOS_SERVICIO = [
  { valor: '', texto: 'Seleccione una opcion' },
  { valor: 'Construccion y obra civil', texto: 'Construccion y obra civil' },
  { valor: 'Suministros', texto: 'Suministro de articulos y equipos' },
  { valor: 'Logistica', texto: 'Apoyo logistico y transporte' },
  { valor: 'Otro', texto: 'Otro / no estoy seguro' },
];

export default function ContactForm() {
  const [form, setForm] = useState(FORM_VACIO);
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  function update(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('sending');
    try {
      await apiClient.post('/quotes/form', form);
      setStatus('sent');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'No fue posible enviar la solicitud. Intente de nuevo en unos minutos.'
      );
      setStatus('idle');
    }
  }

  function nuevaSolicitud() {
    setForm(FORM_VACIO);
    setStatus('idle');
    setError('');
  }

  return (
    <div className="min-h-screen flex flex-col bg-steel-900">
      <PublicHeader />

      <AuthShell
        ancho="lg"
        eyebrow="Formulario directo"
        titulo="Cuentenos que necesita"
        descripcion="Describa su proyecto, el suministro que requiere o el apoyo logistico que necesita. Nuestro equipo tecnico revisara su solicitud y le respondera."
      >
        {status === 'sent' ? (
          <MensajeExito titulo="Solicitud enviada">
            <p className="mb-6">
              Recibimos su solicitud y nuestro equipo tecnico la revisara. Le responderemos al correo o
              telefono que nos indico.
            </p>
            <button
              onClick={nuevaSolicitud}
              className="text-sm font-semibold text-blueprint hover:underline"
            >
              Enviar otra solicitud
            </button>
          </MensajeExito>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <CampoTexto
                label="Nombre completo"
                value={form.full_name}
                onChange={(v) => update('full_name', v)}
                required
              />
              <CampoTexto
                label="Empresa (opcional)"
                value={form.company_name}
                onChange={(v) => update('company_name', v)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <CampoTexto
                label="Correo electronico"
                type="email"
                value={form.email}
                onChange={(v) => update('email', v)}
                required
              />
              <CampoTexto
                label="Telefono"
                type="tel"
                value={form.phone}
                onChange={(v) => update('phone', v)}
                required
              />
            </div>

            <CampoSelect
              label="Tipo de servicio"
              value={form.service_type}
              onChange={(v) => update('service_type', v)}
              opciones={TIPOS_SERVICIO}
            />

            <CampoTextarea
              label="Describa su proyecto"
              value={form.description}
              onChange={(v) => update('description', v)}
              placeholder="Ubicacion, alcance, plazos estimados, materiales que necesita..."
              required
            />

            <MensajeError texto={error} />

            <div className="pt-1">
              <BotonPrincipal loading={status === 'sending'} textoCargando="Enviando...">
                Enviar solicitud
              </BotonPrincipal>
            </div>

            <p className="text-xs text-steel-500 text-center pt-1">
              Los campos marcados con <span className="text-signal">*</span> son obligatorios.
            </p>
          </form>
        )}
      </AuthShell>

      <PublicFooter />
    </div>
  );
}