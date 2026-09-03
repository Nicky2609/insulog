import { useEffect, useState } from 'react';
import apiClient from '../../lib/api';

export default function QuotesInbox() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    const { data } = await apiClient.get('/quotes/form');
    setRequests(data.requests);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id, status) {
    await apiClient.put(`/quotes/form/${id}`, { status });
    loadRequests();
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-steel-800/10 bg-white">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Cotizaciones</p>
        <h1 className="font-display text-2xl text-steel-900">Solicitudes de cotizacion</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {loading ? (
          <p className="text-sm text-steel-500">Cargando...</p>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {requests.length === 0 && (
              <p className="text-sm text-steel-500">Aun no hay solicitudes de cotizacion.</p>
            )}
            {requests.map((req) => (
              <div key={req.id} className="panel-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-steel-900">{req.full_name}</p>
                    <p className="text-xs text-steel-600">
                      {req.email} &middot; {req.phone} {req.company_name ? `· ${req.company_name}` : ''}
                    </p>
                    {req.service_type && (
                      <span className="inline-block mt-2 text-[10px] uppercase tracking-wide font-mono px-2 py-0.5 rounded bg-blueprint-light text-blueprint">
                        {req.service_type}
                      </span>
                    )}
                  </div>
                  <select
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                    className="text-xs border border-steel-800/15 rounded-lg px-2 py-1.5"
                  >
                    <option value="new">Nueva</option>
                    <option value="contacted">Contactado</option>
                    <option value="closed">Cerrado</option>
                  </select>
                </div>
                <p className="text-sm text-steel-700 mt-3 whitespace-pre-wrap">{req.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}