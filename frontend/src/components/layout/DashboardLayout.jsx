import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/panel', code: '00', label: 'Centro de Mando', badge: 'En Vivo', roles: ['admin', 'engineer'], icon: CommandGridIcon },
  { to: '/panel/inventario', code: '01', label: 'Inventario & Acopio', roles: ['admin', 'engineer'], icon: BoxStackIcon },
  { to: '/panel/obras', code: '02', label: 'Frentes de Obra', roles: ['admin', 'engineer'], icon: CraneBuildingIcon },
  { to: '/panel/cotizaciones', code: '03', label: 'Bandeja Comercial', roles: ['admin', 'engineer'], icon: InboxMailIcon },
  { to: '/panel/usuarios', code: '04', label: 'Seguridad & Staff', roles: ['admin'], icon: UserShieldIcon },
];

const ROLE_CONFIG = {
  admin: {
    label: 'Administrador Global',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-500',
  },
  engineer: {
    label: 'Ingeniero Residente',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
};

export default function DashboardLayout() {
  const { profile, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const roleMeta = ROLE_CONFIG[role] || {
    label: 'Personal Técnico',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
  };

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IN';

  // Cierra el drawer móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased text-slate-900 selection:bg-orange-600 selection:text-white">
      {/* =========================================================
          BARRA DE ESTADO MÓVIL (HEADER MOBILE)
      ========================================================= */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-slate-950 border-b border-slate-800/80 px-4 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold font-mono text-sm tracking-tighter shadow-sm border border-orange-500">
            IN
          </div>
          <div>
            <p className="font-extrabold text-white text-sm tracking-tight">INSULOG <span className="text-orange-500 text-xs font-mono font-semibold">S.A.S.</span></p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Portal Técnico</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir panel lateral"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white active:scale-95 transition-all"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Backdrop oscuro para drawer móvil */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================================================
          BARRA LATERAL (SIDEBAR DE ALTA INGENIERÍA)
      ========================================================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-slate-950 text-slate-200 flex flex-col justify-between border-r border-slate-800/90 shadow-2xl
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto
        `}
      >
        {/* Retícula técnica y degradado sutil de iluminación en sidebar */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Encabezado de Identidad Corporativa */}
        <div className="relative z-10 px-6 py-6 border-b border-slate-800/80">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-extrabold font-mono text-base tracking-tighter shadow-lg shadow-orange-950/50 border border-orange-400/30">
                IN
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-base tracking-tight font-sans">INSULOG</span>
                  <span className="text-[11px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.2 rounded">S.A.S.</span>
                </div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
                  Ingeniería & Suministros
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar panel lateral"
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Estado de sincronización operativa */}
          <div className="mt-4 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium">Cantera & Vía Activa</span>
            </div>
            <span className="text-slate-500 text-[10px]">La Belleza</span>
          </div>
        </div>

        {/* 2. Navegación Principal */}
        <div className="relative z-10 flex-1 px-3.5 py-5 overflow-y-auto space-y-1">
          <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 font-bold">
            Módulos del Sistema
          </p>

          <nav className="space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/panel'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-semibold tracking-wide transition-all duration-200 border ${
                      isActive
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent hover:border-slate-800/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                          isActive
                            ? 'bg-orange-700/60 text-white'
                            : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>

                      <span className="flex-1 font-medium">{item.label}</span>

                      {item.badge && isActive ? (
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-orange-800 text-orange-200 font-bold tracking-wider">
                          {item.badge}
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-[10px] transition-colors ${
                            isActive ? 'text-orange-200 font-bold' : 'text-slate-600 group-hover:text-slate-400'
                          }`}
                        >
                          // {item.code}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-6 px-1">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
              <p className="text-[11px] font-semibold text-slate-300">Página Web Pública</p>
              <p className="text-[10px] text-slate-500 leading-snug">
                Portal público de cotizaciones para clientes y constructoras.
              </p>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-orange-400 hover:text-orange-300 font-bold transition-colors pt-1"
              >
                <span>Visitar portal web</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Perfil de Usuario & Salida */}
        <div className="relative z-10 px-4 py-4 border-t border-slate-800/90 bg-slate-950/90">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-orange-400 font-mono font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0 shadow-inner">
              {userInitials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate font-sans">
                {profile?.full_name || 'Funcionario Técnico'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot}`} />
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  {roleMeta.label}
                </span>
              </div>
            </div>

            <button
              onClick={signOut}
              title="Cerrar sesión de trabajo"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-800/40 transition-all shrink-0"
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================
          ÁREA PRINCIPAL DE CONTENIDO (MAIN OUTLET)
      ========================================================= */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-y-auto bg-slate-100/60">
        <Outlet />
      </main>
    </div>
  );
}

// Iconografía vectorial lineal nítida
function CommandGridIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BoxStackIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function CraneBuildingIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="9" width="8" height="12" rx="1" />
      <rect x="12" y="3" width="8" height="18" rx="1" />
      <line x1="6.5" y1="12" x2="6.5" y2="12.01" />
      <line x1="9.5" y1="16" x2="9.5" y2="16.01" />
      <line x1="15" y1="7" x2="15" y2="7.01" />
      <line x1="15" y1="11" x2="15" y2="11.01" />
      <line x1="15" y1="15" x2="15" y2="15.01" />
    </svg>
  );
}

function InboxMailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function UserShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6 1.1 0 2.1.3 3 .8" />
      <path d="M19 12v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3v-4l3-2Z" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ExternalLinkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}