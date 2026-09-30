import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const BuildingConstructionScene = lazy(
  () => import('../components/three/BuildingConstructionScene')
);

/*
 * PALETA
 * El mockup original usaba un naranja oxido (#a33900) como color primario
 * sobre fondo claro. Aqui se restaura la jerarquia del proyecto: el azul
 * (steel / blueprint) es el color de marca -coherente con el logo- y el
 * naranja (signal, #E8590C) queda reservado para acciones y remates.
 *
 * CONTENIDO
 * Las tres divisiones corresponden al objeto social registrado en el
 * certificado de existencia y representacion legal (Camara de Comercio de
 * Bucaramanga). No se incluyen certificaciones, indicadores de desempeno
 * ni sedes que no consten en ese documento.
 */

const DIVISIONES = [
  {
    numero: '01',
    division: 'DIVISION TECNICA',
    etiqueta: 'CIVIL',
    titulo: 'Construccion y Obras Civiles',
    descripcion:
      'Construccion, adecuacion, reparacion y mantenimiento de toda clase de edificaciones, para el sector publico y privado.',
    puntos: [
      'Vivienda de todos los tipos',
      'Infraestructura vial',
      'Adecuacion de alcantarillados',
      'Escenarios deportivos: construccion y mantenimiento',
    ],
    acento: 'blueprint',
    Icono: IconoEdificacion,
  },
  {
    numero: '02',
    division: 'DIVISION DE SUMINISTROS',
    etiqueta: 'SUMINISTROS',
    titulo: 'Suministro de Articulos y Equipos',
    descripcion:
      'Provision de articulos para entidades publicas y privadas, dentro de los parametros establecidos y con la respectiva garantia y seriedad.',
    puntos: [
      'Papeleria, computadores y equipos perifericos',
      'Toner, tintas y elementos de oficina',
      'Elementos deportivos',
      'Elementos quimicos de cafeteria y aseo',
    ],
    acento: 'signal',
    Icono: IconoSuministros,
  },
  {
    numero: '03',
    division: 'DIVISION DE LOGISTICA',
    etiqueta: 'LOGISTICA',
    titulo: 'Apoyo Logistico y Distribucion',
    descripcion:
      'Apoyo logistico y distribucion de materiales y equipos hacia el frente de obra o la sede del cliente, coordinado desde la plataforma interna.',
    puntos: [
      'Transporte y entrega a pie de obra',
      'Coordinacion de despachos por proyecto',
      'Trazabilidad del suministro por obra',
      'Seguimiento en tiempo real desde el panel',
    ],
    acento: 'blueprint',
    Icono: IconoLogistica,
  },
];

const REDES_TECNICAS = [
  'Redes electricas',
  'Redes electronicas',
  'Redes sanitarias',
  'Redes hidraulicas',
];

export default function PublicLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-steel-950 text-concrete-100">
      <PublicHeader />

      {/* ==========================================================
          HERO
      ========================================================== */}
      <section className="relative w-full overflow-hidden bg-steel-900 border-b border-blueprint-bright/20">
        <div className="absolute inset-0 blueprint-grid-dark opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Narrativa */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start bg-steel-800/70 border border-blueprint-bright/25 px-3 py-1.5 rounded">
                <span className="w-2 h-2 rounded-full bg-signal" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-blueprint-bright">
                  Construccion &middot; Suministros &middot; Logistica
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mt-2">
                Construimos la infraestructura y la{' '}
                <span className="text-blueprint-bright">logistica</span> que sostienen cada obra.
              </h1>

              <p className="text-concrete-200/85 text-base lg:text-lg leading-relaxed max-w-2xl">
                Ingenieria Suministros y Logistica Insulog S.A.S. desarrolla proyectos de arquitectura y
                obra civil en el ambito publico y privado, y presta servicios de suministro de articulos
                y apoyo logistico, en un solo equipo tecnico.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/cotizar"
                  className="inline-flex items-center gap-2 bg-signal text-white font-semibold text-xs uppercase tracking-[0.12em] px-6 py-3.5 rounded-lg shadow-lg shadow-signal/25 hover:bg-signal-dark transition-colors"
                >
                  Solicitar cotizacion
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <a
                  href="#divisiones"
                  className="inline-flex items-center gap-2 border border-white/25 text-white font-semibold text-xs uppercase tracking-[0.12em] px-6 py-3.5 rounded-lg hover:bg-white/10 hover:border-white/40 transition-colors"
                >
                  Conocer servicios
                </a>
              </div>

              {/* Datos de registro: los unicos "indicadores" que constan en
                  un documento oficial. Reemplazan a las metricas inventadas
                  del mockup (99.4%, +180K m3, 14 frentes). */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 mt-2 border-t border-white/10">
                <DatoRegistro etiqueta="NIT" valor="901.589.014-1" />
                <DatoRegistro etiqueta="Domicilio" valor="Floridablanca, Santander" />
                <DatoRegistro etiqueta="Constituida en" valor="2022" />
              </div>
            </div>

            {/* Visual: modelo 3D propio, en lugar de fotografias de archivo */}
            <div className="lg:col-span-5 relative">
              <div className="w-full bg-steel-950/70 border border-blueprint-bright/25 rounded-xl p-3 shadow-2xl">
                <div className="aspect-[4/5] w-full flex flex-col">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-concrete-400 shrink-0">
                    <span>Insulog &middot; Modelo 3D</span>
                    <span className="text-blueprint-bright flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blueprint-bright" />
                      Obra en proceso
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 w-full">
                    <Suspense
                      fallback={
                        <div className="w-full h-full flex items-center justify-center text-[11px] font-mono text-blueprint-bright">
                          Cargando modelo 3D...
                        </div>
                      }
                    >
                      <BuildingConstructionScene />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          DIVISIONES
      ========================================================== */}
      <section id="divisiones" className="w-full bg-paper py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal font-semibold">
                Lineas de negocio
              </span>
              <h2 className="font-display text-3xl lg:text-4xl text-steel-900 mt-2 tracking-tight">
                Estructura operativa integral, de la planeacion a la entrega.
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel-600 whitespace-nowrap">
              Construccion &middot; Suministros &middot; Logistica
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIVISIONES.map((div) => {
              const esSignal = div.acento === 'signal';
              const textoAcento = esSignal ? 'text-signal' : 'text-blueprint';
              const barraAcento = esSignal ? 'bg-signal' : 'bg-blueprint';
              const fondoIcono = esSignal
                ? 'bg-signal-light text-signal-dark'
                : 'bg-blueprint-light text-blueprint';
              const Icono = div.Icono;

              return (
                <div
                  key={div.numero}
                  className="group flex flex-col panel-card overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`h-1.5 ${barraAcento}`} />

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between pb-5">
                      <span className={`font-mono text-[11px] font-semibold ${textoAcento}`}>
                        {div.numero} // {div.division}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-concrete-100 text-steel-700">
                        {div.etiqueta}
                      </span>
                    </div>

                    <div
                      className={`w-14 h-14 rounded-lg flex items-center justify-center mb-5 ${fondoIcono}`}
                    >
                      <Icono />
                    </div>

                    <h3 className="font-display text-xl lg:text-2xl text-steel-900">{div.titulo}</h3>

                    <p className="text-sm text-steel-600 mt-3 leading-relaxed">{div.descripcion}</p>

                    <div className="mt-6 pt-4 border-t border-steel-800/10 flex flex-col gap-2.5">
                      {div.puntos.map((punto) => (
                        <div key={punto} className="flex items-start gap-2 text-sm text-steel-700">
                          <span className={`${textoAcento} mt-0.5 shrink-0`} aria-hidden="true">
                            &#10003;
                          </span>
                          <span>{punto}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Redes tecnicas: tambien parte del objeto social registrado */}
          <div className="mt-10 panel-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="sm:w-64 shrink-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal font-semibold">
                  Tambien ejecutamos
                </span>
                <p className="font-display text-xl text-steel-900 mt-1">Redes tecnicas</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {REDES_TECNICAS.map((red) => (
                  <span
                    key={red}
                    className="px-3 py-1.5 rounded-lg bg-concrete-100 border border-steel-800/10 text-sm text-steel-700"
                  >
                    {red}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          PLATAFORMA INTERNA (funcionalidad real del proyecto)
      ========================================================== */}
      <section className="w-full bg-steel-900 py-20 lg:py-24 relative overflow-hidden border-y border-blueprint-bright/15">
        <div className="absolute inset-0 blueprint-grid-dark opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start bg-blueprint/15 border border-blueprint-bright/30 px-3 py-1.5 rounded text-blueprint-bright">
                <IconoSinSenal />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold">
                  Opera sin conexion
                </span>
              </div>

              <h2 className="font-display text-3xl lg:text-4xl text-white tracking-tight">
                Control de inventario que funciona aun sin senal en la obra.
              </h2>

              <p className="text-concrete-200/85 text-base lg:text-lg leading-relaxed">
                Los frentes de obra no siempre tienen cobertura movil. Nuestra plataforma interna guarda
                en el dispositivo los ajustes de entrada y salida de material que el personal tecnico
                registra sin conexion, y los sincroniza de forma automatica en cuanto el equipo recupera
                internet.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <TarjetaFuncion
                  titulo="Movimientos, no reemplazos"
                  texto="Cada ajuste se guarda como entrada o salida, de modo que los registros de varios equipos se integran sin perder informacion."
                  acento="blueprint"
                />
                <TarjetaFuncion
                  titulo="Cola visible"
                  texto="La aplicacion muestra cuantos movimientos quedan pendientes de sincronizar, para que nadie asuma que un registro se perdio."
                  acento="signal"
                />
              </div>
            </div>

            {/* Representacion de la interfaz real, sin datos de ejemplo
                inventados: se describe la funcion, no se simulan despachos. */}
            <div className="lg:col-span-6">
              <div className="bg-surface rounded-xl shadow-panel overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 bg-concrete-100 border-b border-steel-800/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-signal" />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-900">
                      Panel interno Insulog
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase text-steel-600">
                    Acceso restringido
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <ModuloPanel titulo="Inventario" nota="Existencias y stock minimo" />
                    <ModuloPanel titulo="Obras" nota="Estado de cada proyecto" />
                    <ModuloPanel titulo="Cotizaciones" nota="Solicitudes recibidas" />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <FilaModulo texto="Importacion y exportacion del inventario en Excel" />
                    <FilaModulo texto="Registro fotografico de materiales y obras" />
                    <FilaModulo texto="Acceso por roles: administrador e ingeniero" />
                    <FilaModulo texto="Ajustes de existencias sin conexion, con sincronizacion automatica" />
                  </div>

                  <div className="mt-5 pt-4 border-t border-steel-800/10 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-steel-600">
                      Uso exclusivo del personal de Insulog
                    </span>
                    <Link
                      to="/ingresar"
                      className="text-xs font-semibold text-blueprint hover:underline whitespace-nowrap"
                    >
                      Acceso interno &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          MISION Y CONTACTO
      ========================================================== */}
      <section className="w-full bg-paper py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal font-semibold">
                Nuestro compromiso
              </span>

              <h2 className="font-display text-3xl lg:text-4xl text-steel-900 tracking-tight">
                Antes, durante y despues de finalizado el proyecto.
              </h2>

              <p className="text-steel-700 text-base lg:text-lg leading-relaxed mt-1">
                Nuestra mision es satisfacer las necesidades de nuestros clientes antes, durante y
                despues de finalizado el proyecto, dando cumplimiento a los estandares de calidad y a
                los plazos fijados, con exigencia en el control de calidad de nuestros productos
                terminados.
              </p>

              <p className="text-steel-600 text-sm lg:text-base leading-relaxed">
                Aspiramos a ser la empresa constructora de referencia a nivel regional, liderando el
                mercado por medio de la responsabilidad y la eficiencia, y logrando que nuestro personal
                se sienta motivado y orgulloso de pertenecer a la organizacion.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-2 border-t border-steel-800/10">
                <ValorCorporativo texto="Trabajo bien hecho y mejora continua" />
                <ValorCorporativo texto="Cliente informado en todo momento" />
                <ValorCorporativo texto="Formacion continua del equipo" />
                <ValorCorporativo texto="Alianzas con proveedores y clientes" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="panel-card p-8">
                <h3 className="font-display text-2xl text-steel-900">Cuentenos que necesita</h3>
                <p className="text-sm text-steel-600 mt-2 mb-6 leading-relaxed">
                  Describa su proyecto, el suministro que requiere o el apoyo logistico que necesita.
                  Nuestro equipo tecnico revisara su solicitud y le respondera.
                </p>

                <div className="space-y-3 mb-6">
                  <DatoEmpresa
                    etiqueta="Razon social"
                    valor="Ingenieria Suministros y Logistica Insulog S.A.S."
                  />
                  <DatoEmpresa etiqueta="NIT" valor="901.589.014-1" />
                  <DatoEmpresa etiqueta="Domicilio principal" valor="Floridablanca, Santander" />
                </div>

                <Link
                  to="/cotizar"
                  className="w-full inline-flex items-center justify-center gap-2 bg-signal text-white font-semibold text-xs uppercase tracking-[0.12em] py-3.5 rounded-lg hover:bg-signal-dark transition-colors"
                >
                  Solicitar cotizacion
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES
============================================================ */

function DatoRegistro({ etiqueta, valor }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-blueprint-bright/70">
        {etiqueta}
      </span>
      <span className="font-display text-lg text-white mt-0.5 leading-tight">{valor}</span>
    </div>
  );
}

function TarjetaFuncion({ titulo, texto, acento }) {
  const color = acento === 'signal' ? 'text-signal' : 'text-blueprint-bright';
  return (
    <div className="bg-steel-950/60 border border-white/10 rounded-lg p-4">
      <p className={`font-semibold text-sm mb-1.5 ${color}`}>{titulo}</p>
      <p className="text-xs text-concrete-200/75 leading-relaxed">{texto}</p>
    </div>
  );
}

function ModuloPanel({ titulo, nota }) {
  return (
    <div className="bg-concrete-100 rounded-lg p-3">
      <p className="font-display text-base text-steel-900 leading-tight">{titulo}</p>
      <p className="text-[11px] text-steel-600 mt-1 leading-snug">{nota}</p>
    </div>
  );
}

function FilaModulo({ texto }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-steel-700">
      <span className="text-blueprint mt-0.5 shrink-0" aria-hidden="true">
        &#10003;
      </span>
      <span>{texto}</span>
    </div>
  );
}

function ValorCorporativo({ texto }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-signal text-xs mt-0.5 shrink-0" aria-hidden="true">
        &#10003;
      </span>
      <p className="text-xs text-steel-600 leading-snug">{texto}</p>
    </div>
  );
}

function DatoEmpresa({ etiqueta, valor }) {
  return (
    <div className="flex flex-col border-b border-steel-800/10 pb-2.5 last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-wider text-steel-500">{etiqueta}</span>
      <span className="text-sm text-steel-900 font-medium mt-0.5">{valor}</span>
    </div>
  );
}

/* ============================================================
   ICONOS (trazo propio, coherentes con el resto del sitio)
============================================================ */

function IconoEdificacion() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="9" width="8" height="12" />
      <rect x="13" y="3" width="8" height="18" />
      <line x1="6" y1="12.5" x2="8" y2="12.5" />
      <line x1="6" y1="16.5" x2="8" y2="16.5" />
      <line x1="16" y1="7" x2="18" y2="7" />
      <line x1="16" y1="11" x2="18" y2="11" />
      <line x1="16" y1="15" x2="18" y2="15" />
    </svg>
  );
}

function IconoSuministros() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function IconoLogistica() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="1" y="6" width="13" height="10" rx="1" />
      <path d="M14 9h4l3 3v4h-7z" />
      <circle cx="6" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </svg>
  );
}

function IconoSinSenal() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M16.7 11.1c0.8 0.4 1.6 0.9 2.3 1.5" />
      <path d="M5 12.6c1.5-1.2 3.3-2 5.2-2.4" />
      <path d="M8.5 16.1c2-1.6 5-1.6 7 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}