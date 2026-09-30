import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function Login() {
  /* ----- Hooks globales ----- */
  const { signIn } = useAuth();
  const navigate = useNavigate();

  /* ----- Estado del formulario ----- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ----- Handlers ----- */
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/panel', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Credenciales no autorizadas. Verifique su correo o clave.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* ----- Render ----- */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-orange-600 selection:text-white">
      <PublicHeader />

      <main className="flex-1 relative flex items-center justify-center py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        {/* Retícula técnica de fondo (blueprint grid sutil) */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,23,42,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* =========================================================
              COLUMNA IZQUIERDA: CONTEXTO TÉCNICO & IDENTIDAD
              ========================================================= */}
          <BrandPanel />

          {/* =========================================================
              COLUMNA DERECHA: TARJETA DE CREDENCIALES
              ========================================================= */}
          <div className="lg:col-span-7">
            <LoginCard
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              error={error}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES
   ============================================================ */

function BrandPanel() {
  return (
    <div className="lg:col-span-5 space-y-6 text-left">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 border border-slate-300 text-slate-800 text-[11px] font-mono font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
          Terminal Técnico Directo
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange-600 font-bold">
          Insulog S.A.S. // IT Infrastructure
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight font-sans">
          Control de Obras, Despachos y Cadena de Suministro
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-normal pt-1">
          Consola unificada para supervisión georreferenciada de frentes viales,
          balance de agregados pétreos en cantera y autorización de despachos
          certificados.
        </p>
      </div>

      {/* Fichas técnicas de estado del sistema */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <MiniStat
          label="Frentes Activos"
          value="14"
          hint="Santander & Boyacá"
          valueClass="text-slate-950"
        />
        <MiniStat
          label="Flota en Ruta"
          value="38"
          hint="Trazabilidad Satelital"
          valueClass="text-orange-600"
        />
      </div>

      {/* Acceso para clientes externos */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl space-y-1.5">
        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>¿Es cliente o contratista externo?</span>
        </p>
        <p className="text-xs text-slate-500 leading-snug">
          Genere estimaciones preliminares de áridos, maquinaria pesada y mezclas
          sin credenciales internas.
        </p>
        <Link
          to="/cotizar"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-600 hover:text-orange-700 transition-colors pt-1"
        >
          <span>Ir al cotizador institucional abierto</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function LoginCard({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  error,
  loading,
  onSubmit,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden relative">
      {/* Barra superior de acento con protocolo */}
      <div className="bg-slate-950 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-200 font-medium">
            Módulo de Seguridad Perimetral & Staff
          </span>
        </div>
        <span className="text-slate-500 hidden sm:inline">
          Protocolo SSL-TLSv1.3
        </span>
      </div>

      <div className="p-6 sm:p-10 space-y-6">
        {/* Cabecera del formulario */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-white font-extrabold font-mono text-lg tracking-tighter border border-slate-800 shadow-md">
            IN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-950 text-xl tracking-tight">
                Acceso al Centro de Mando
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Portal de autenticación exclusivo para personal directivo,
              ingenieros y supervisores.
            </p>
          </div>
        </div>

        {/* Mensaje de auditoría activa */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3 text-slate-600 text-xs">
          <InfoIcon className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-800">Aviso de auditoría activa:</strong>{' '}
            Todo ingreso queda registrado en el libro digital de bitácora
            conforme a la norma ISO 9001 e ISO 27001. No comparta su token de
            hardware.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Correo Corporativo */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              <span>Correo Corporativo Asignado</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">
                @insulog.com.co
              </span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ingenieria.residente@insulog.com.co"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Contraseña Segura de Despacho
              </label>
              <Link
                to="/olvide-password"
                className="text-xs font-mono text-orange-600 hover:text-orange-700 hover:underline font-semibold"
              >
                ¿Olvidó su contraseña?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LockIcon className="w-4 h-4" />
              </span>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-10 pr-11 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Recordatorio de terminal segura */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
              />
              <span className="text-slate-600 text-xs">
                Recordar terminal seguro (72 hrs)
              </span>
            </label>
            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldIcon className="w-3 h-3 text-slate-400" />
              Cierre automático activo
            </span>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200/90 rounded-xl p-3 text-rose-700 text-xs font-mono flex items-start gap-2 animate-shake">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Botón Principal de Envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl shadow-md shadow-orange-950/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verificando Credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Centro de Mando</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer del formulario con canal de soporte */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
          <span>¿Nuevo funcionario o asignación de frente?</span>
          <a
            href="tel:+576076978420"
            className="text-orange-600 font-bold hover:underline"
          >
            Contactar Soporte TI (PBX Ext. 104)
          </a>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTES UI AUXILIARES
   ============================================================ */

function MiniStat({ label, value, hint, valueClass }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
        {label}
      </p>
      <p className={`text-2xl font-extrabold font-mono mt-1 ${valueClass}`}>
        {value}
      </p>
      <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
    </div>
  );
}

/* ============================================================
   ICONOGRAFÍA VECTORIAL LINEAL (ESTILO INGENIERÍA)
   ============================================================ */

function ShieldCheckIcon(props) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ShieldIcon(props) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UserIcon(props) {
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
      <circle cx="12" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
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

function EyeIcon(props) {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props) {
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
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function InfoIcon(props) {
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
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
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