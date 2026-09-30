import { useEffect, useState } from 'react';
import apiClient from '../../lib/api';

const STATUS_CONFIG = {
  new: {
    label: 'Nueva Solicitud',
    badge: 'bg-orange-50 text-orange-700 border-orange-200/80',
    dot: 'bg-orange-600 animate-pulse',
    select: 'text-orange-700 bg-orange-50 border-orange-200',
  },
  contacted: {
    label: 'En Gestión / Contactado',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-600',
    select: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  closed: {
    label: 'Cotización Cerrada',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-600',
    select: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
};

const SERVICE_BADGES = {
  'Construcción': 'bg-slate-100 text-slate-800 border-slate-200',
  'Suministros': 'bg-amber-50 text-amber-800 border-amber-200',
  'Logística': 'bg-blue-50 text-blue-800 border-blue-200',
};

export default function QuotesInbox() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  async function loadRequests() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/quotes/form');
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error cargando cotizaciones:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id, status) {
    try {
      await apiClient.put(`/quotes/form/${id}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Error actualizando estado:', err);
      loadRequests();
    }
  }

  // Métricas operativas
  const totalCount = requests.length;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const contactedCount = requests.filter((r) => r.status === 'contacted').length;
  const closedCount = requests.filter((r) => r.status === 'closed').length;

  // Filtrado reactivo
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const matchesSearch =
      !search ||
      req.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      req.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      req.email?.toLowerCase().includes(search.toLowerCase()) ||
      req.service_type?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
      {/* =========================================================
          ENCABEZADO EDITORIAL DE COTIZACIONES
      ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            Módulo 03 // Bandeja de Cotizaciones & Prospectos
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-sans">
            Solicitudes de Cotización
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Atención comercial de clientes, requerimientos de agregados pétreos, maquinaria pesada y contratos de obra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRequests}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            <RefreshIcon className="w-4 h-4 text-slate-500" />
            <span>Actualizar Bandeja</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TILES DE MÉTRICAS OPERATIVAS (KPI TILES)
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Requerimientos</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-slate-950 font-mono">{loading ? '—' : totalCount}</p>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Formulario web</span>
          </div>
        </div>

        <div className={`rounded-xl p-5 border shadow-sm relative overflow-hidden transition-colors ${newCount > 0 ? 'bg-orange-50/60 border-orange-200' : 'bg-white border-slate-200/90'
          }`}>
          <div className={`absolute top-0 left-0 right-0 h-1 ${newCount > 0 ? 'bg-orange-600' : 'bg-slate-300'}`} />
          <p className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${newCount > 0 ? 'text-orange-700' : 'text-slate-400'}`}>
            Nuevas Sin Atender
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className={`text-3xl font-extrabold font-mono ${newCount > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
              {loading ? '—' : newCount}
            </p>
            {newCount > 0 ? (
              <span className="text-xs font-mono font-bold text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded animate-pulse">
                Respuesta pendiente
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Al día</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">En Gestión / Contactado</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-blue-600 font-mono">{loading ? '—' : contactedCount}</p>
            <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">En negociación</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Cotizaciones Cerradas</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-emerald-700 font-mono">{loading ? '—' : closedCount}</p>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Despacho o archivo</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          BARRA DE CONTROL: BÚSQUEDA & FILTROS RÁPIDOS
      ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all ${filterStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Todas ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('new')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${filterStatus === 'new'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
            Nuevas ({newCount})
          </button>
          <button
            onClick={() => setFilterStatus('contacted')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${filterStatus === 'contacted'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Contactados ({contactedCount})
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${filterStatus === 'closed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
          >
            Cerradas ({closedCount})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente, empresa, servicio..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* =========================================================
          BANDEJA DE SOLICITUDES (CARDS EDITORIALES)
      ========================================================= */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-xs uppercase text-slate-500 tracking-wider">Cargando bandeja comercial...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 p-6">
          <div className="max-w-sm mx-auto space-y-2">
            <p className="text-4xl">📨</p>
            <p className="font-bold text-slate-900 text-base">No hay solicitudes en esta vista</p>
            <p className="text-xs text-slate-500">
              {search ? 'Intente modificando los términos de búsqueda o filtros.' : 'Las nuevas solicitudes enviadas desde la página web pública aparecerán aquí automáticamente.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((req) => {
            const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.new;
            const serviceClass = SERVICE_BADGES[req.service_type] || 'bg-slate-100 text-slate-800 border-slate-200';
            const initials = req.full_name
              ? req.full_name
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
              : 'CL';

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group border-l-4"
                style={{
                  borderLeftColor: req.status === 'new' ? '#ea580c' : req.status === 'contacted' ? '#2563eb' : '#059669',
                }}
              >
                <div className="p-6 space-y-4">
                  {/* Encabezado del Prospecto */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-800 shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                          {req.full_name}
                        </h3>
                        {req.company_name && (
                          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                            <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{req.company_name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selector de Estado Rápido */}
                    <div className="shrink-0">
                      <select
                        value={req.status}
                        onChange={(e) => updateStatus(req.id, e.target.value)}
                        className={`text-xs font-mono font-bold uppercase tracking-wider border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-600 cursor-pointer ${statusCfg.select}`}
                      >
                        <option value="new">Nueva</option>
                        <option value="contacted">Contactado</option>
                        <option value="closed">Cerrado</option>
                      </select>
                    </div>
                  </div>

                  {/* Badges de Contacto & Servicio */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {req.service_type && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${serviceClass}`}>
                        <span>📌</span>
                        <span>{req.service_type}</span>
                      </span>
                    )}

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${statusCfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Canales de Contacto Directo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <a
                      href={`mailto:${req.email}`}
                      className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors truncate"
                      title="Enviar correo"
                    >
                      <MailIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.email}</span>
                    </a>
                    <a
                      href={`tel:${req.phone}`}
                      className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors"
                      title="Llamar al cliente"
                    >
                      <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.phone || 'Sin teléfono'}</span>
                    </a>
                  </div>

                  {/* Mensaje / Requerimiento del Cliente */}
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                      Descripción del Requerimiento:
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs font-sans">
                      {req.description || 'Sin detalles adicionales especificados.'}
                    </p>
                  </div>
                </div>

                {/* Footer de Gestión */}
                <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>ID-COT #{req.id}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${req.email}?subject=Cotización%20Insulog%20S.A.S.%20-%20Requerimiento%20#${req.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-wider text-[11px] transition-colors"
                    >
                      <SendIcon className="w-3 h-3" />
                      <span>Responder</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function BuildingIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
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

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}