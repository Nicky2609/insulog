/*
 * Piezas compartidas por las pantallas de formulario (ingresar, recuperar
 * contrasena, restablecer y cotizar), para que todas hereden la misma
 * estetica de la pagina principal: fondo steel-900 con reticula blueprint,
 * titular en font-display, antetitulo en font-mono naranja, y el
 * formulario sobre una tarjeta blanca con sombra.
 */

// ------------------------------------------------------------------
// Contenedor de pagina
// ------------------------------------------------------------------

export function AuthShell({ eyebrow, titulo, descripcion, children, ancho = 'md', pie }) {
    const maxAncho = ancho === 'lg' ? 'max-w-3xl' : 'max-w-md';

    return (
        <section className="relative flex-1 w-full overflow-hidden">
            <div className="absolute inset-0 blueprint-grid-dark opacity-60 pointer-events-none" />

            <div className={`relative z-10 ${maxAncho} mx-auto px-6 py-16 lg:py-20 w-full`}>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">{eyebrow}</p>

                <h1 className="font-display text-3xl lg:text-4xl text-white tracking-tight">{titulo}</h1>

                {descripcion && (
                    <p className="text-concrete-200/80 text-sm lg:text-base mt-3 leading-relaxed max-w-xl">
                        {descripcion}
                    </p>
                )}

                <div className="bg-surface rounded-xl shadow-panel p-6 lg:p-8 mt-8">{children}</div>

                {pie && <div className="mt-6">{pie}</div>}
            </div>
        </section>
    );
}

// ------------------------------------------------------------------
// Campos
// ------------------------------------------------------------------

const CLASE_CAMPO =
    'mt-1.5 w-full border border-steel-800/15 rounded-lg px-3.5 py-2.5 text-sm text-steel-900 ' +
    'placeholder:text-steel-500/60 focus:outline-none focus:border-blueprint focus:ring-1 focus:ring-blueprint transition-colors';

export function Etiqueta({ children, requerido }) {
    return (
        <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
            {children}
            {requerido && <span className="text-signal ml-1">*</span>}
        </span>
    );
}

export function CampoTexto({
    label,
    type = 'text',
    value,
    onChange,
    required = false,
    placeholder,
    autoComplete,
}) {
    return (
        <label className="block">
            <Etiqueta requerido={required}>{label}</Etiqueta>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={CLASE_CAMPO}
            />
        </label>
    );
}

export function CampoSelect({ label, value, onChange, opciones, required = false }) {
    return (
        <label className="block">
            <Etiqueta requerido={required}>{label}</Etiqueta>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className={`${CLASE_CAMPO} bg-white`}
            >
                {opciones.map((op) => (
                    <option key={op.valor} value={op.valor}>
                        {op.texto}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function CampoTextarea({ label, value, onChange, required = false, placeholder, filas = 5 }) {
    return (
        <label className="block">
            <Etiqueta requerido={required}>{label}</Etiqueta>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                rows={filas}
                className={`${CLASE_CAMPO} resize-none`}
            />
        </label>
    );
}

// ------------------------------------------------------------------
// Acciones y mensajes
// ------------------------------------------------------------------

export function BotonPrincipal({ children, loading, textoCargando = 'Enviando...', disabled }) {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className="w-full bg-signal text-white font-semibold text-sm uppercase tracking-[0.1em] px-6 py-3.5 rounded-lg shadow-lg shadow-signal/20 hover:bg-signal-dark transition-colors disabled:opacity-60 disabled:shadow-none"
        >
            {loading ? textoCargando : children}
        </button>
    );
}

export function MensajeError({ texto }) {
    if (!texto) return null;
    return (
        <div className="flex items-start gap-2 rounded-lg bg-signal-light border border-signal/30 px-3.5 py-3">
            <span className="text-signal-dark text-sm font-bold leading-none mt-0.5" aria-hidden="true">
                !
            </span>
            <p className="text-sm text-signal-dark">{texto}</p>
        </div>
    );
}

// Pantalla de confirmacion, reutilizada tras enviar una solicitud o
// completar el restablecimiento de contrasena.
export function MensajeExito({ titulo, children }) {
    return (
        <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-blueprint-light text-blueprint flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            </div>
            <p className="font-display text-xl text-steel-900 mb-2">{titulo}</p>
            <div className="text-sm text-steel-600 leading-relaxed">{children}</div>
        </div>
    );
}