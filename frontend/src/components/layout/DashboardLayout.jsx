import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/panel', code: '00', label: 'Panel', roles: ['admin', 'engineer'], icon: GridIcon },
  { to: '/panel/inventario', code: '01', label: 'Inventario', roles: ['admin', 'engineer'], icon: BoxIcon },
  { to: '/panel/obras', code: '02', label: 'Obras', roles: ['admin', 'engineer'], icon: BuildingIcon },
  { to: '/panel/cotizaciones', code: '03', label: 'Cotizaciones', roles: ['admin', 'engineer'], icon: MailIcon },
  { to: '/panel/usuarios', code: '04', label: 'Usuarios', roles: ['admin'], icon: UsersIcon },
];

const ROLE_LABELS = {
  admin: 'Administrador',
  engineer: 'Ingeniero',
};

export default function DashboardLayout() {
  const { profile, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  // Close the mobile drawer automatically whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Mobile top bar: only visible below lg, holds the hamburger toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-steel-950 px-4 py-3">
        <div className="bg-white rounded-lg p-1.5 inline-block">
          <img src="/insulog-logo.jpg" alt="Insulog S.A.S." className="h-6 w-auto rounded-sm" />
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/15 text-white"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Backdrop behind the mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-steel-950/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-steel-950 text-white flex flex-col overflow-hidden
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto
        `}
      >
        <div className="absolute inset-0 blueprint-grid-dark opacity-60 pointer-events-none" />

        <div className="relative flex items-start justify-between px-6 py-6 border-b border-white/10">
          <div>
            <div className="bg-white rounded-lg p-2 inline-block">
              <img src="/insulog-logo.jpg" alt="Insulog S.A.S." className="h-8 w-auto rounded-sm" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-blueprint-bright/70 mt-3">
              Panel interno
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menu"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 text-white shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="relative flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/panel'}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-md pl-4 pr-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-concrete-200 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r transition-colors ${isActive ? 'bg-signal' : 'bg-transparent group-hover:bg-white/20'
                        }`}
                    />
                    <Icon className="shrink-0 opacity-80" />
                    <span className="flex-1">{item.label}</span>
                    <span className="font-mono text-[10px] text-blueprint-bright/50">{item.code}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="relative px-6 py-5 border-t border-white/10">
          <p className="text-sm font-semibold">{profile?.full_name}</p>
          <p className="text-xs text-concrete-200">{ROLE_LABELS[role]}</p>
          <button
            onClick={signOut}
            className="mt-3 text-xs uppercase tracking-wide text-signal hover:text-white transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GridIcon({ className }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function BoxIcon({ className }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function BuildingIcon({ className }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="9" width="8" height="12" />
      <rect x="12" y="3" width="8" height="18" />
      <line x1="6.5" y1="12" x2="6.5" y2="12.01" />
      <line x1="9.5" y1="16" x2="9.5" y2="16.01" />
      <line x1="15" y1="7" x2="15" y2="7.01" />
      <line x1="15" y1="11" x2="15" y2="11.01" />
      <line x1="15" y1="15" x2="15" y2="15.01" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 6l10 7 10-7" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.4" />
      <path d="M21.5 20c0-2.6-1.8-4.8-4.2-5.5" />
    </svg>
  );
}