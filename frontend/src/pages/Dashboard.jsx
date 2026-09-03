import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/api';
import { useAuth } from '../context/AuthContext';

const SHORTCUTS = {
  inventario: { code: '01', title: 'Inventario', description: 'Gestione materiales y stock', accent: 'blueprint' },
  obras: { code: '02', title: 'Obras', description: 'Control de proyectos en curso', accent: 'signal' },
  cotizaciones: { code: '03', title: 'Cotizaciones', description: 'Solicitudes recibidas por formulario', accent: 'blueprint' },
  usuarios: { code: '04', title: 'Usuarios', description: 'Roles y accesos del equipo', accent: 'signal' },
};

export default function Dashboard() {
  const { profile, role } = useAuth();
  const isStaff = role === 'admin' || role === 'engineer';

  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isStaff) return;
    Promise.all([
      apiClient.get('/inventory'),
      apiClient.get('/projects'),
      apiClient.get('/quotes/form'),
    ])
      .then(([inv, proj, quo]) => {
        setItems(inv.data.items);
        setProjects(proj.data.projects);
        setQuotes(quo.data.requests);
      })
      .finally(() => setLoadingStats(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lowStock = items.filter((item) => Number(item.quantity) <= Number(item.min_stock));
  const activeProjects = projects.filter((p) => p.status === 'in_progress');
  const newQuotes = quotes.filter((q) => q.status === 'new');

  return (
    <div className="p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Panel</p>
      <h1 className="font-display text-3xl text-steel-900 mb-2">Hola, {profile?.full_name?.split(' ')[0]}</h1>
      <p className="text-steel-600 mb-8">Este es el resumen de su acceso a Insulog.</p>

      {isStaff && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatTile
              to="/panel/inventario"
              label="Items en inventario"
              value={loadingStats ? '—' : items.length}
              accent="blueprint"
            />
            <StatTile
              to="/panel/inventario"
              label="Stock bajo"
              value={loadingStats ? '—' : lowStock.length}
              accent="alert"
              urgent={!loadingStats && lowStock.length > 0}
            />
            <StatTile
              to="/panel/obras"
              label="Obras en ejecucion"
              value={loadingStats ? '—' : activeProjects.length}
              accent="signal"
            />
            <StatTile
              to="/panel/cotizaciones"
              label="Cotizaciones nuevas"
              value={loadingStats ? '—' : newQuotes.length}
              accent="blueprint"
              urgent={!loadingStats && newQuotes.length > 0}
            />
          </div>

          {!loadingStats && (lowStock.length > 0 || newQuotes.length > 0) && (
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {lowStock.length > 0 && (
                <div className="panel-card p-5">
                  <p className="font-display text-lg text-steel-900 mb-1">Stock por debajo del minimo</p>
                  <p className="text-xs text-steel-500 mb-4">Revise estos items antes de que se agoten.</p>
                  <ul className="space-y-2">
                    {lowStock.slice(0, 5).map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-steel-700">{item.name}</span>
                        <span className="font-mono text-signal">
                          {item.quantity} / {item.min_stock} {item.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/panel/inventario" className="mt-4 inline-block text-xs text-blueprint font-semibold hover:underline">
                    Ver inventario completo
                  </Link>
                </div>
              )}

              {newQuotes.length > 0 && (
                <div className="panel-card p-5">
                  <p className="font-display text-lg text-steel-900 mb-1">Cotizaciones sin atender</p>
                  <p className="text-xs text-steel-500 mb-4">Solicitudes recibidas por el formulario publico.</p>
                  <ul className="space-y-2">
                    {newQuotes.slice(0, 5).map((quote) => (
                      <li key={quote.id} className="text-sm">
                        <span className="text-steel-700 font-medium">{quote.full_name}</span>
                        {quote.service_type && <span className="text-steel-500"> &middot; {quote.service_type}</span>}
                      </li>
                    ))}
                  </ul>
                  <Link to="/panel/cotizaciones" className="mt-4 inline-block text-xs text-blueprint font-semibold hover:underline">
                    Ver todas las cotizaciones
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel-500 mb-3">Accesos rapidos</p>
      <div className="grid md:grid-cols-3 gap-5 max-w-3xl">
        {isStaff && (
          <>
            <ShortcutCard to="/panel/inventario" {...SHORTCUTS.inventario} />
            <ShortcutCard to="/panel/obras" {...SHORTCUTS.obras} />
            <ShortcutCard to="/panel/cotizaciones" {...SHORTCUTS.cotizaciones} />
          </>
        )}
        {role === 'admin' && <ShortcutCard to="/panel/usuarios" {...SHORTCUTS.usuarios} />}
      </div>
    </div>
  );
}

function StatTile({ to, label, value, accent, urgent }) {
  const valueColor = urgent ? 'text-signal' : accent === 'signal' ? 'text-signal' : 'text-steel-900';
  return (
    <Link to={to} className="panel-card p-5 hover:-translate-y-0.5 transition-transform block">
      <p className="text-xs text-steel-500 uppercase tracking-wide">{label}</p>
      <p className={`font-display text-4xl mt-2 ${valueColor}`}>{value}</p>
    </Link>
  );
}

function ShortcutCard({ to, code, title, description, accent }) {
  const bar = accent === 'signal' ? 'bg-signal' : 'bg-blueprint';
  return (
    <Link to={to} className="group panel-card overflow-hidden hover:-translate-y-0.5 transition-transform">
      <div className={`h-1 ${bar}`} />
      <div className="p-5">
        <p className="font-mono text-[10px] text-steel-500 mb-1">{code}</p>
        <p className="font-display text-xl text-steel-900 group-hover:text-signal transition-colors">{title}</p>
        <p className="text-sm text-steel-600 mt-1">{description}</p>
      </div>
    </Link>
  );
}