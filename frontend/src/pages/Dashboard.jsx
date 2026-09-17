import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ESTADO_OBRA = {
  planning: 'En planeacion',
  in_progress: 'En ejecucion',
  paused: 'Pausada',
  finished: 'Finalizada',
};

export default function Dashboard() {
  const { profile, role } = useAuth();
  const isStaff = role === 'admin' || role === 'engineer';

  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (!isStaff) {
      setLoadingStats(false);
      return;
    }
    Promise.all([
      apiClient.get('/inventory'),
      apiClient.get('/projects'),
      apiClient.get('/quotes/form'),
    ])
      .then(([inv, proj, quo]) => {
        setItems(inv.data.items || []);
        setProjects(proj.data.projects || []);
        setQuotes(quo.data.requests || []);
      })
      .catch(() => { })
      .finally(() => setLoadingStats(false));
  }, [isStaff]);

  // El indicador de conexion refleja el estado real del dispositivo, no un
  // valor fijo: es lo que determina si los ajustes de inventario se
  // guardaran en cola local o iran directo al servidor.
  useEffect(() => {
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const lowStock = items.filter((item) => Number(item.quantity) <= Number(item.min_stock));
  const activeProjects = projects.filter((p) => p.status === 'in_progress');
  const newQuotes = quotes.filter((q) => q.status === 'new');

  const valor = (v) => (loadingStats ? '—' : v);

  return (
    <div className="p-6 sm:p-8 bg-slate-50 min-h-screen text-slate-900">
      {/* ==========================================================
          CABECERA
      ========================================================== */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-orange-500' : 'bg-emerald-500'}`}
            />
            <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
              Insulog S.A.S. &middot; Panel interno
            </p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Hola, {profile?.full_name?.split(' ')[0] || 'usuario'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 border ${isOffline
              ? 'bg-orange-50 border-orange-200 text-orange-800'
              : 'bg-cyan-50 border-cyan-200 text-cyan-800'
              }`}
          >
            <span className="font-bold">{isOffline ? 'SIN CONEXION' : 'EN LINEA'}</span>
            <span className="text-[10px] opacity-75">
              {isOffline ? '(ajustes en cola local)' : '(sincronizado)'}
            </span>
          </div>

          {(role === 'admin' || role === 'engineer') && (
            <Link
              to="/panel/inventario"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold tracking-wide"
            >
              Ir a inventario
            </Link>
          )}
        </div>
      </div>

      {/* ==========================================================
          METRICAS (todas calculadas a partir de datos reales)
      ========================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          titulo="Stock bajo minimo"
          etiqueta={lowStock.length > 0 ? 'ALERTA' : 'OK'}
          etiquetaColor={lowStock.length > 0 ? 'orange' : 'emerald'}
          valor={valor(`${lowStock.length} item(s)`)}
          nota="Items en o por debajo del stock minimo"
          to="/panel/inventario"
        />
        <MetricCard
          titulo="Items en inventario"
          etiqueta="CATALOGO"
          etiquetaColor="slate"
          valor={valor(items.length)}
          nota="Referencias registradas en total"
          to="/panel/inventario"
        />
        <MetricCard
          titulo="Obras en ejecucion"
          etiqueta="ACTIVAS"
          etiquetaColor="emerald"
          valor={valor(`${activeProjects.length} de ${projects.length}`)}
          nota="Proyectos con estado en ejecucion"
          to="/panel/obras"
        />
        <MetricCard
          titulo="Cotizaciones nuevas"
          etiqueta="INBOX"
          etiquetaColor="blue"
          valor={valor(newQuotes.length)}
          nota="Solicitudes sin atender"
          to="/panel/cotizaciones"
        />
      </div>

      {/* ==========================================================
          DETALLE
      ========================================================== */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stock bajo minimo - datos reales del inventario */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Materiales por reabastecer</h2>
              <p className="text-xs text-slate-500">
                Items cuya cantidad esta en o por debajo del minimo definido
              </p>
            </div>
            <Link
              to="/panel/inventario"
              className="text-xs font-semibold text-cyan-600 hover:underline whitespace-nowrap"
            >
              Ver inventario &rarr;
            </Link>
          </div>

          {loadingStats ? (
            <p className="text-sm text-slate-500 py-6 text-center">Cargando...</p>
          ) : lowStock.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Ningun item esta por debajo del stock minimo.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-mono uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3">Bodega / obra</th>
                    <th className="py-2.5 px-3">Cantidad</th>
                    <th className="py-2.5 px-3">Minimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStock.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-[11px] font-mono text-slate-400">{item.code}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {item.warehouse_location || item.projects?.name || '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-orange-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{item.min_stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lowStock.length > 6 && (
                <p className="text-[11px] text-slate-400 mt-3">
                  y {lowStock.length - 6} item(s) mas.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cotizaciones sin atender - reemplaza el panel de bascula, que no
            corresponde a ningun proceso registrado de la empresa */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900">Cotizaciones recientes</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              INBOX
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Solicitudes recibidas por el formulario publico.
          </p>

          <div className="flex-1">
            {loadingStats ? (
              <p className="text-sm text-slate-500 py-6 text-center">Cargando...</p>
            ) : newQuotes.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No hay cotizaciones sin atender.
              </p>
            ) : (
              <ul className="space-y-3">
                {newQuotes.slice(0, 5).map((quote) => (
                  <li key={quote.id} className="border-b border-slate-100 pb-2.5 last:border-0">
                    <p className="text-sm font-semibold text-slate-900">{quote.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      {quote.company_name || quote.email}
                      {quote.service_type ? ` \u00b7 ${quote.service_type}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/panel/cotizaciones"
            className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg tracking-wide transition-colors text-center block"
          >
            Ver todas las cotizaciones
          </Link>
        </div>
      </div>

      {/* ==========================================================
          OBRAS ACTIVAS
      ========================================================== */}
      {!loadingStats && activeProjects.length > 0 && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Obras en ejecucion</h2>
              <p className="text-xs text-slate-500">Proyectos actualmente en curso</p>
            </div>
            <Link
              to="/panel/obras"
              className="text-xs font-semibold text-cyan-600 hover:underline whitespace-nowrap"
            >
              Ver obras &rarr;
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.slice(0, 6).map((project) => (
              <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-slate-900 text-sm">{project.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{project.location || 'Sin ubicacion'}</p>
                {project.client_name && (
                  <p className="text-[11px] text-slate-400 mt-1">Cliente: {project.client_name}</p>
                )}
                <span className="inline-block mt-3 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                  {ESTADO_OBRA[project.status] || project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ titulo, etiqueta, etiquetaColor, valor, nota, to }) {
  const colores = {
    orange: 'bg-orange-100 text-orange-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <Link
      to={to}
      className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all block"
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-xs font-mono text-slate-500 uppercase">{titulo}</p>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono whitespace-nowrap ${colores[etiquetaColor] || colores.slate
            }`}
        >
          {etiqueta}
        </span>
      </div>
      <p className="text-3xl font-bold font-mono text-slate-900 mt-2">{valor}</p>
      <p className="text-xs text-slate-500 mt-1">{nota}</p>
    </Link>
  );
}