import { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

// Loaded only when the landing page actually renders
const BuildingConstructionScene = lazy(
  () => import('../components/three/BuildingConstructionScene')
);

// ============================================================
// ICONOS DE LAS TARJETAS DESTACADAS (linea, sin emojis)
// ============================================================

function HelmetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M3 15h18" />
      <path d="M3 15v1.5a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5V15" />
      <path d="M12 7V4" />
      <path d="M9.5 4h5" />
    </svg>
  );
}

function MapPinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function TrackingIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 15l3-3 2.5 2.5L17 9" />
      <path d="M17 9h3v3" />
    </svg>
  );
}

// ============================================================
// TARJETAS DESTACADAS
// ============================================================

const HIGHLIGHT_CARDS = [
  {
    id: 'tech-team',
    title: 'Equipo técnico propio',
    description: 'Ingenieros y técnicos especializados en obra civil',
    Icon: HelmetIcon,
  },
  {
    id: 'coverage',
    title: 'Cobertura en La Belleza',
    description: 'y municipios cercanos del occidente de Boyacá',
    Icon: MapPinIcon,
  },
  {
    id: 'tracking',
    title: 'Seguimiento directo',
    description: 'de cada obra con reportes en tiempo real',
    Icon: TrackingIcon,
  },
];

// Servicios
const SERVICES = [
  {
    code: 'OB-01',
    title: 'Construcción',
    description:
      'Ejecución de obra civil, interventoría técnica y dirección de proyectos de principio a fin.',
    accent: 'signal',
  },
  {
    code: 'OB-02',
    title: 'Suministros',
    description:
      'Materiales, equipos y herramienta certificada, con control de inventario en tiempo real.',
    accent: 'blueprint',
  },
  {
    code: 'OB-03',
    title: 'Logística',
    description:
      'Transporte, bodegaje y distribución de materiales hacia el frente de obra.',
    accent: 'signal',
  },
];

// Iconos para servicios
const ServiceIcon = ({ type }) => {
  const icons = {
    Construcción: '🏗️',
    Suministros: '📦',
    Logística: '🚛',
  };

  return (
    <span className="text-2xl">
      {icons[type] || '🔧'}
    </span>
  );
};

export default function PublicLanding() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-steel-900">
      <PublicHeader />

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative bg-steel-900 overflow-hidden">

        {/* Fondo con retícula de ingeniería */}
        <div className="absolute inset-0 blueprint-grid-dark">

          {/* Efectos de iluminación */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/3 rounded-full blur-2xl" />

        </div>

        {/* Texto vertical técnico */}
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-12 border-l border-blueprint-bright/15 items-center justify-center z-10">
          <p
            className="text-sm font-mono tracking-[0.4em] text-blueprint-bright/40 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl' }}
          >
            PLANO TÉCNICO · INSULOG · CADENA DE SUMINISTRO · ESC 1:100
          </p>
        </div>

        {/* =========================================================
            CONTENIDO PRINCIPAL
        ========================================================= */}

        <div
          className="
            max-w-7xl
            2xl:max-w-[105rem]
            mx-auto
            px-6
            lg:pr-20
            pt-3
            md:pt-4
            pb-16
            md:pb-20
            lg:pb-24
            relative
            grid
            lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]
            gap-8
            lg:gap-6
            items-start
          "
        >

          {/* =======================================================
              COLUMNA IZQUIERDA
          ======================================================= */}

          <div className="relative z-10">

            {/* NIT / Ubicación */}
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-blueprint-bright/60 mb-1.5 border-b border-blueprint-bright/10 pb-1 inline-block">
              NIT 901.589.014-1 · La Belleza, Colombia
            </p>

            {/* Título */}
            <h1
              className="font-display leading-[0.92] text-white max-w-xl tracking-tight"
              style={{ fontSize: 'clamp(2.75rem, calc(8.57vw - 4.2rem), 6.5rem)' }}
            >
              Construimos la logística
              <span className="block text-blueprint-bright">
                detrás de cada obra.
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mt-5 max-w-lg text-concrete-200/80 text-lg leading-relaxed">
              Insulog S.A.S. integra ingeniería de construcción, suministro
              de materiales y logística de transporte en un solo equipo
              técnico especializado.
            </p>

            {/* Botones */}
            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/cotizar"
                className="
                  bg-signal
                  text-white
                  font-semibold
                  px-7
                  py-3.5
                  rounded-lg
                  shadow-lg
                  shadow-signal/25
                  hover:bg-signal-dark
                  hover:shadow-signal/40
                  transition-all
                  duration-300
                  text-base
                "
              >
                Solicitar cotización
              </Link>

              <Link
                to="#servicios"
                className="
                  border-2
                  border-white/25
                  text-white
                  font-semibold
                  px-7
                  py-3.5
                  rounded-lg
                  hover:bg-white/10
                  hover:border-white/40
                  transition-all
                  duration-300
                  text-base
                "
              >
                Ver servicios
              </Link>

            </div>

            {/* =====================================================
                TARJETAS
            ===================================================== */}

            <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">

              {HIGHLIGHT_CARDS.map((card) => {
                const Icon = card.Icon;
                return (
                  <div
                    key={card.id}
                    className="
                      group
                      relative
                      overflow-hidden
                      bg-steel-800/50
                      backdrop-blur-sm
                      border
                      border-blueprint-bright/15
                      rounded-xl
                      p-4
                      shadow-lg
                      shadow-black/10
                      hover:border-blueprint-bright/40
                      hover:bg-steel-800/70
                      hover:-translate-y-0.5
                      transition-all
                      duration-300
                    "
                  >
                    {/* Barra de acento superior */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blueprint-bright/60 to-blueprint-bright/0" />

                    <div
                      className="
                        w-11
                        h-11
                        rounded-lg
                        bg-blueprint-bright/10
                        border
                        border-blueprint-bright/20
                        flex
                        items-center
                        justify-center
                        mb-3
                        group-hover:bg-blueprint-bright/20
                        group-hover:border-blueprint-bright/40
                        transition-colors
                        duration-300
                      "
                    >
                      <Icon className="w-5 h-5 text-blueprint-bright" />
                    </div>

                    <p className="text-white text-sm font-semibold leading-tight">
                      {card.title}
                    </p>

                    <p className="text-white/80 text-sm leading-snug mt-1.5">
                      {card.description}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>

          {/* =======================================================
              COLUMNA DERECHA — BUILDING
              
              IMPORTANTE:
              Aquí está el único ajuste relacionado con el edificio.
              NO se modifica BuildingConstructionScene.
          ======================================================= */}

          <div
            className="
              relative
              w-full
              h-[480px]
              sm:h-[540px]
              md:h-[600px]
              lg:h-[620px]
              xl:h-[650px]
              min-w-0
              overflow-visible
              flex
              items-center
              justify-center
            "
          >

            {/* Contenedor REAL del Canvas */}
            <div
              className="
                relative
                w-full
                h-full
                min-w-0
                flex
                items-center
                justify-center
              "
            >

              <Suspense
                fallback={
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        w-full
                        h-full
                        max-w-[760px]
                        bg-steel-800/30
                        rounded-xl
                        animate-pulse
                      "
                    />
                  </div>
                }
              >
                {isClient && (
                  <div
                    className="
                      relative
                      w-full
                      h-full
                      max-w-[760px]
                    "
                  >
                    <BuildingConstructionScene />
                  </div>
                )}
              </Suspense>

            </div>

            {/* =====================================================
                OVERLAYS DECORATIVOS
            ===================================================== */}

            <div
              className="
                absolute
                -bottom-6
                -left-6
                opacity-30
                pointer-events-none
                hidden
                lg:block
              "
            >
              <div className="text-blueprint-bright/20 text-4xl">
                🚛
              </div>
            </div>

            <div
              className="
                absolute
                -top-4
                -right-4
                opacity-20
                pointer-events-none
                hidden
                lg:block
              "
            >
              <div className="text-blueprint-bright/15 text-3xl">
                🏗️
              </div>
            </div>

          </div>
        </div>

        {/* Línea técnica inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blueprint-bright/20 to-transparent" />

      </section>

      {/* =========================================================
          LÍNEA DE COTA
      ========================================================= */}

      <div className="h-0.5 bg-gradient-to-r from-blueprint-bright/0 via-blueprint-bright/30 to-blueprint-bright/0" />

      {/* =========================================================
          SERVICIOS
      ========================================================= */}

      <section
        id="servicios"
        className="max-w-7xl 2xl:max-w-[105rem] mx-auto px-6 py-20 w-full bg-paper"
      >

        <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">
          Líneas de servicio
        </p>

        <h2 className="font-display text-4xl text-steel-900 mb-12">
          Lo que hacemos
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {SERVICES.map((service) => {

            const accentClasses =
              service.accent === 'signal'
                ? 'bg-signal-light text-signal-dark'
                : 'bg-blueprint-light text-blueprint';

            const topBarClass =
              service.accent === 'signal'
                ? 'bg-signal'
                : 'bg-blueprint';

            return (
              <div
                key={service.code}
                className="
                  group
                  panel-card
                  overflow-hidden
                  hover:shadow-lg
                  hover:-translate-y-1
                  transition-all
                  duration-200
                  bg-white
                  rounded-lg
                "
              >

                <div className={`h-1.5 ${topBarClass}`} />

                <div className="p-8">

                  <div
                    className={`
                      w-12
                      h-12
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      mb-5
                      ${accentClasses}
                    `}
                  >
                    <ServiceIcon type={service.title} />
                  </div>

                  <p className="font-mono text-xs text-steel-500 mb-2">
                    {service.code}
                  </p>

                  <h3 className="font-display text-2xl text-steel-900 mb-3">
                    {service.title}
                  </h3>

                  <p className="text-steel-600 text-sm leading-relaxed">
                    {service.description}
                  </p>

                </div>
              </div>
            );
          })}

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}