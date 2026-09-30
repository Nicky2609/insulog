import { useState } from 'react';
import apiClient from '../../lib/api';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';

/* ============================================================
   CONSTANTES DE DOMINIO
   ============================================================ */
const SERVICIOS = [
  {
    id: 'Construccion y obra civil',
    code: 'LÍNEA 01',
    title: 'Obra Civil & Vías',
    desc: 'Placa huellas, gaviones, muros de contención y pavimentos.',
    icon: BuildingRoadIcon,
  },
  {
    id: 'Suministros',
    code: 'LÍNEA 02',
    title: 'Material de Cantera',
    desc: 'Base BG-1, sub-base SBG-1, triturados 1/2", 3/4" y afirmados.',
    icon: MountainRockIcon,
  },
  {
    id: 'Logistica',
    code: 'LÍNEA 03',
    title: 'Maquinaria & Transporte',
    desc: 'Excavadoras orugadas, volquetas dobletroque y vibrocompactadores.',
    icon: TruckExcavatorIcon,
  },
  {
    id: 'Contrato Integral',
    code: 'LÍNEA 04',
    title: 'Contrato Integral',
    desc: 'Suministro puesto en obra, control topográfico y ensayos técnicos.',
    icon: ShieldContractIcon,
  },
];

const VOLUMENES = [
  { value: '', label: 'Seleccionar volumen aproximado' },
  {
    value: 'Menor a 100 m³ (1 a 7 viajes)',
    label: 'Volumen Menor (< 100 m³ / 1 a 7 viajes)',
  },
  {
    value: '100 a 500 m³ (Frente vial estándar)',
    label: 'Volumen Medio (100 a 500 m³)',
  },
  {
    value: 'Mayor a 500 m³ (Obra mayor o licitación)',
    label: 'Obra Mayor (> 500 m³ / Suministro continuo)',
  },
  {
    value: 'Solo alquiler de maquinaria',
    label: 'Solo alquiler de maquinaria / Flete',
  },
];

const EMPTY_FORM = {
  full_name: '',
  company_name: '',
  email: '',
  phone: '',
  service_type: 'Suministros',
  location: '',
  volume: '',
  description: '',
};

const COBERTURA = {
  'Santander Sur': [
    'La Belleza (Tolva Principal)',
    'Jesús María & Florián',
    'Sucre & Bolívar',
    'Vélez, Guavatá & Barbosa',
  ],
  'Boyacá Occidente': [
    'Chiquinquirá & Saboyá',
    'Moniquirá & San José de Pare',
    'Corredor Vial Barbosa - Tunja',
    'Puente Nacional',
  ],
};

const NORMAS_INVIAS = [
  { code: 'Artículo 300', label: 'Afirmados y Sub-bases' },
  { code: 'Artículo 320', label: 'Bases Granulares BG-1' },
  { code: 'Artículo 500', label: 'Agregados para Concreto' },
];

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function ContactForm() {
  /* ----- Estado del formulario ----- */
  const [form, setForm] = useState(EMPTY_FORM);

  /* ----- Estado de envío ----- */
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');

  /* ----- Handlers ----- */
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setStatus('idle');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('sending');

    // Construye la descripción enriquecida con todo el detalle técnico
    const compositeDescription = [
      form.location ? `[FRENTE / MUNICIPIO]: ${form.location}` : null,
      form.volume ? `[VOLUMEN ESTIMADO]: ${form.volume}` : null,
      form.description ? `[DETALLE TÉCNICO]:\n${form.description}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const payload = {
        full_name: form.full_name,
        company_name: form.company_name,
        email: form.email,
        phone: form.phone,
        service_type: form.service_type || 'Suministros',
        description: compositeDescription || form.description,
      };

      await apiClient.post('/quotes/form', payload);

      // Código de radicado simbólico de ingeniería
      const randomRad = 'INS-' + Math.floor(1000 + Math.random() * 9000);
      setTicketId(randomRad);
      setStatus('sent');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'No fue posible radicar la solicitud técnica. Por favor verifique los datos o contáctenos vía telefónica.'
      );
      setStatus('idle');
    }
  }

  /* ----- Render ----- */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-orange-600 selection:text-white">
      <PublicHeader />

      <HeaderSection />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* =====================================================
              COLUMNA IZQUIERDA: ESPECIFICACIONES & GARANTÍAS
              ===================================================== */}
          <aside className="lg:col-span-5 space-y-6">
            <OperationsProtocolCard />
            <CoverageCard />
            <DirectContactCard />
          </aside>

          {/* =====================================================
              COLUMNA DERECHA: FICHA INTERACTIVA DE RADICACIÓN
              ===================================================== */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
              <ProtocolHeaderBar />

              {status === 'sent' ? (
                <SuccessPanel
                  ticketId={ticketId}
                  form={form}
                  onReset={handleReset}
                />
              ) : (
                <RadicationForm
                  form={form}
                  update={update}
                  status={status}
                  error={error}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <InviasQualityBanner />

      <PublicFooter />

      <FormStyles />
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES — SECCIONES ESTRUCTURALES
   ============================================================ */

function HeaderSection() {
  return (
    <section className="relative bg-white border-b border-slate-200/80 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-mono font-semibold uppercase tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
          Ventanilla Única Comercial & Licitaciones // Servicio al Contratista
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-sans">
              Solicitud Técnica de Suministro & Obra
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Plataforma centralizada de despacho operativo y cubicación para
              ingenieros residentes, directores de interventoría y consorcios
              viales. Despacho directo desde{' '}
              <strong className="text-slate-900 font-semibold">
                Cantera La Belleza
              </strong>{' '}
              con ensayos granulométricos INVIAS y atención técnica garantizada.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shrink-0 text-left lg:text-right font-mono">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Base Central La Belleza // Santander
            </p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              SLA de Respuesta: T-120 Minutos
            </p>
          </div>
        </div>

        <DispatchMetricsGrid />
      </div>
    </section>
  );
}

function DispatchMetricsGrid() {
  const metrics = [
    { label: 'Capacidad Despacho', value: '1,800', unit: 'm³/día', color: 'text-slate-950' },
    { label: 'Flota Dobletroque', value: '28', unit: 'Unidades', color: 'text-orange-600' },
    { label: 'Norma Cumplimiento', value: 'Art. 300', unit: 'INVIAS', color: 'text-slate-950' },
    { label: 'Disponibilidad Cantera', value: '24/7', unit: 'Operativa', color: 'text-emerald-700' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-100">
      {metrics.map((m) => (
        <div key={m.label}>
          <p className="font-mono text-[10px] uppercase text-slate-400 font-semibold">
            {m.label}
          </p>
          <p className={`text-xl font-extrabold font-mono mt-0.5 ${m.color}`}>
            {m.value}{' '}
            <span className="text-xs text-slate-500 font-normal">{m.unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES — COLUMNA IZQUIERDA
   ============================================================ */

function OperationsProtocolCard() {
  const items = [
    {
      icon: ClockIcon,
      iconClass: 'bg-orange-50 text-orange-600 border-orange-200/60',
      title: 'Respuesta Técnica Inmediata',
      text: 'Revisión directa por el Ingeniero de Suministros en menos de 2 horas hábiles. Modelación de distancias y cálculo de fletes.',
    },
    {
      icon: CheckCertIcon,
      iconClass: 'bg-blue-50 text-blue-600 border-blue-200/60',
      title: 'Ensayos y Trazabilidad INVIAS',
      text: 'Certificados de laboratorio por lote de cantera: Granulometría, Desgaste Los Ángeles, Micro-Deval y Equivalente de Arena.',
    },
    {
      icon: TruckIcon,
      iconClass: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Flota Pesada Georreferenciada',
      text: 'Volquetas dobletroque de 14m³ y 16m³ equipadas con GPS activo, telemetría y protocolos de seguridad vial para descargas en frentes rurales.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400 font-bold">
          Protocolo de Operaciones
        </p>
        <span className="font-mono text-[10px] text-orange-600 font-semibold">
          SGC-INS-2025
        </span>
      </div>

      <div className="space-y-3.5 text-xs text-slate-600">
        {items.map((item) => (
          <ProtocolItem key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

function ProtocolItem({ icon: Icon, iconClass, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconClass}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900">{title}</h4>
        <p className="text-slate-500 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function CoverageCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400 font-bold">
        Corredores de Cobertura Prioritaria
      </p>
      <p className="text-xs text-slate-500">
        Rutas de transporte pesadas activas con tiempos de descarga
        programados:
      </p>

      <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
        <CoverageColumn
          title="Santander Sur"
          titleClass="text-orange-600"
          cities={COBERTURA['Santander Sur']}
        />
        <CoverageColumn
          title="Boyacá Occidente"
          titleClass="text-blue-600"
          cities={COBERTURA['Boyacá Occidente']}
        />
      </div>
    </div>
  );
}

function CoverageColumn({ title, titleClass, cities }) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
      <p className={`font-bold uppercase text-[10px] ${titleClass}`}>{title}</p>
      <ul className="text-slate-600 space-y-0.5 text-[11px]">
        {cities.map((city) => (
          <li key={city}>• {city}</li>
        ))}
      </ul>
    </div>
  );
}

function DirectContactCard() {
  const rows = [
    { label: 'Línea Técnica y PBX:', value: '+57 (607) 697-8420', valueClass: 'text-slate-100' },
    { label: 'Despacho Cantera Directo:', value: '+57 (316) 429-9104', valueClass: 'text-orange-400' },
  ];

  return (
    <div className="bg-slate-950 text-white rounded-2xl p-6 space-y-3 border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-orange-400 font-bold">
          Canal de Contacto Directo
        </p>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-2 text-xs font-mono">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between border-b border-slate-800 pb-1.5"
          >
            <span className="text-slate-400">{r.label}</span>
            <span className={`font-bold ${r.valueClass}`}>{r.value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="text-slate-400">WhatsApp Licitaciones:</span>
          <a
            href="https://wa.me/573164299104"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            +57 316 4299104 ↗
          </a>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400">Correo Técnico:</span>
          <span className="text-slate-200">cotizaciones@insulog.com.co</span>
        </div>
      </div>

      <p className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        Horario de Recepción Técnica: Lunes a Sábado 06:00 a 18:00 COT
      </p>
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES — COLUMNA DERECHA (FICHA DE RADICACIÓN)
   ============================================================ */

function ProtocolHeaderBar() {
  return (
    <div className="bg-slate-950 px-6 sm:px-8 py-3.5 flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-orange-600 rounded-sm" />
        <span className="font-bold text-white tracking-wide uppercase">
          Radicación de Requerimiento Técnico
        </span>
      </div>
      <span className="text-slate-400 text-[10px] hidden sm:inline flex items-center gap-1">
        <LockIcon className="w-3 h-3 text-slate-400" />
        SSL 256-BIT // COD: INS-2025-Q1
      </span>
    </div>
  );
}

function SuccessPanel({ ticketId, form, onReset }) {
  const whatsappText = `Hola,%20acabo%20de%20radicar%20la%20cotización%20${ticketId}%20a%20nombre%20de%20${encodeURIComponent(
    form.full_name
  )}.`;

  return (
    <div className="p-8 sm:p-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center text-3xl shadow-xs">
        ✓
      </div>

      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-600 font-bold">
          Radicado Generado Exitosamente
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Requerimiento Técnico en Evaluación
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Hemos recibido los datos de su proyecto. Un ingeniero residente
          asignado revisará la disponibilidad de tolva y elaborará el
          presupuesto oficial.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left font-mono text-xs space-y-2">
        <SummaryRow label="Número de Radicado:" value={ticketId} valueClass="font-bold text-slate-900" />
        <SummaryRow label="Titular Solicitante:" value={form.full_name} valueClass="font-medium text-slate-800" />
        <SummaryRow label="Línea de Suministro:" value={form.service_type} valueClass="font-medium text-orange-600" />
        <SummaryRow
          label="Respuesta Estimada:"
          value="En menos de 2 horas hábiles"
          valueClass="font-bold text-emerald-700"
          last
        />
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          Radicar Nueva Solicitud
        </button>
        <a
          href={`https://wa.me/573164299104?text=${whatsappText}`}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm inline-flex items-center justify-center gap-2"
        >
          <span>Priorizar por WhatsApp</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueClass, last }) {
  return (
    <div
      className={`flex justify-between ${
        last ? 'pt-0.5' : 'border-b border-slate-200 pb-1.5'
      }`}
    >
      <span className="text-slate-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function RadicationForm({ form, update, status, error, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="p-6 sm:p-8 md:p-10 space-y-6">
      <ServiceSelector
        value={form.service_type}
        onChange={(v) => update('service_type', v)}
      />

      <ApplicantFields form={form} update={update} />

      <ScopeFields form={form} update={update} />

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
          {error}
        </div>
      )}

      <HabeasDataCheckbox />

      <SubmitButton status={status} />
    </form>
  );
}

function ServiceSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
          <span>1. Seleccione la Línea de Suministro o Servicio *</span>
          <span className="text-[10px] text-slate-400 font-normal">
            Obligatorio
          </span>
        </span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICIOS.map((srv) => (
          <ServiceCard
            key={srv.id}
            service={srv}
            selected={value === srv.id}
            onSelect={() => onChange(srv.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service, selected, onSelect }) {
  const Icon = service.icon;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
        selected
          ? 'bg-orange-50/50 border-orange-600 shadow-xs'
          : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-[9px] font-bold uppercase text-orange-600 tracking-wider">
          {service.code}
        </span>
        <Icon
          className={`w-4 h-4 ${selected ? 'text-orange-600' : 'text-slate-400'}`}
        />
      </div>
      <div className="mt-2">
        <p className="font-bold text-slate-900 text-sm">{service.title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
          {service.desc}
        </p>
      </div>
    </div>
  );
}

function ApplicantFields({ form, update }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
        2. Datos del Contratista o Solicitante
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nombre y Apellidos *">
          <input
            required
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            placeholder="Ing. Juan Sebastián Pérez"
            className="form-input font-medium"
          />
        </FormField>
        <FormField label="Razón Social / Consorcio Vial">
          <input
            value={form.company_name}
            onChange={(e) => update('company_name', e.target.value)}
            placeholder="Consorcio Pavimentos Santander 2025"
            className="form-input"
          />
        </FormField>
        <FormField label="Correo Electrónico Corporativo *">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="residencia@obracivil.com"
            className="form-input font-mono"
          />
        </FormField>
        <FormField label="Teléfono Móvil de Contacto Directo *">
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+57 310 000 0000"
            className="form-input font-mono"
          />
        </FormField>
      </div>
    </div>
  );
}

function ScopeFields({ form, update }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
        3. Alcance de Obra & Frente Geográfico
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Municipio / Vereda / PR Vial *">
          <input
            required
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="Ej: La Belleza - Vereda El Hato, KM 4"
            className="form-input"
          />
        </FormField>
        <FormField label="Volumen Estimado Requerido *">
          <select
            required
            value={form.volume}
            onChange={(e) => update('volume', e.target.value)}
            className="form-input font-mono"
          >
            {VOLUMENES.map((vol) => (
              <option key={vol.value} value={vol.value}>
                {vol.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Especificaciones Técnicas, Material & Cronograma Estimado *">
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Indique tipos de materiales requeridos (ej. Base Granular BG-1, Triturado 3/4 para concreto f'c 28 MPa), fecha proyectada de inicio de descargas, accesibilidad de la vía para vehículos dobletroque de 14m³ y si requiere ensayo particular de laboratorio."
          className="form-input resize-none"
        />
      </FormField>
    </div>
  );
}

function HabeasDataCheckbox() {
  return (
    <div className="pt-2">
      <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] text-slate-500 leading-snug">
        <input
          type="checkbox"
          required
          className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
        />
        <span>
          Autorizo el tratamiento de mis datos personales de acuerdo con la Ley
          1581 de 2012 de la República de Colombia y la Política de Privacidad
          de Insulog S.A.S. para fines estrictamente comerciales y de
          liquidación técnica de obra.
        </span>
      </label>
    </div>
  );
}

function SubmitButton({ status }) {
  return (
    <div className="pt-2">
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider py-4 px-6 rounded-xl shadow-md shadow-orange-950/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
      >
        {status === 'sending' ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Radicando Requerimiento...</span>
          </>
        ) : (
          <>
            <span>Radicar Solicitud de Cotización</span>
            <ArrowRightIcon className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

/* ============================================================
   SECCIÓN INFERIOR — CALIDAD INVIAS
   ============================================================ */

function InviasQualityBanner() {
  return (
    <section className="bg-white border-t border-slate-200/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-orange-600 font-bold">
            Control de Calidad & Origen
          </p>
          <h3 className="text-xl font-extrabold text-slate-950">
            Certificación de Fuentes de Materiales
          </h3>
          <p className="text-xs text-slate-500 max-w-xl">
            Cada metro cúbico despachado desde nuestro centro de acopio cumple
            con las normas técnicas del Instituto Nacional de Vías (INVIAS
            2013-2022).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {NORMAS_INVIAS.map((n) => (
            <NormBadge key={n.code} code={n.code} label={n.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NormBadge({ code, label }) {
  return (
    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
      <span className="text-slate-400 block text-[10px]">{code}</span>
      <span className="font-bold text-slate-800">{label}</span>
    </div>
  );
}

/* ============================================================
   COMPONENTES UI AUXILIARES
   ============================================================ */

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function FormStyles() {
  return (
    <style>{`
      .form-input {
        width: 100%;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        padding: 0.65rem 0.85rem;
        font-size: 0.8125rem;
        color: #0f172a;
        outline: none;
        transition: all 0.2s;
      }
      .form-input:focus {
        background-color: #ffffff;
        border-color: #ea580c;
        box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.15);
      }
    `}</style>
  );
}

/* ============================================================
   ICONOGRAFÍA VECTORIAL
   ============================================================ */

function BuildingRoadIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-3" />
      <path d="M9 9v.01" />
      <path d="M9 13v.01" />
      <path d="M9 17v.01" />
    </svg>
  );
}

function MountainRockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function TruckExcavatorIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function ShieldContractIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCertIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function TruckIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}