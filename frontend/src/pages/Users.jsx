import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

const ROLE_LABELS = { admin: 'Administrador', engineer: 'Ingeniero' };
const EMPTY_FORM = { full_name: '', email: '', password: '', role: 'engineer' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  async function loadUsers() {
    setLoading(true);
    const { data } = await apiClient.get('/users');
    setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    try {
      await apiClient.post('/users', form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'No fue posible crear el usuario.');
    }
  }

  async function handleRoleChange(id, role) {
    await apiClient.put(`/users/${id}/role`, { role });
    loadUsers();
  }

  async function handleStatusToggle(user) {
    await apiClient.put(`/users/${user.id}/status`, { is_active: !user.is_active });
    loadUsers();
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Usuarios</p>
          <h1 className="font-display text-3xl text-steel-900">Roles y accesos</h1>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-signal text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-signal-dark transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nuevo usuario de staff'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="panel-card p-5 mb-6 grid md:grid-cols-4 gap-4 items-end">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">Nombre</span>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="mt-1 w-full border border-steel-800/15 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">Correo</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="mt-1 w-full border border-steel-800/15 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">Contraseña temporal</span>
            <input
              required
              type="text"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="mt-1 w-full border border-steel-800/15 rounded-lg px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-[11px] text-steel-500">
              Se le pedira cambiarla en su primer ingreso.
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">Rol</span>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="mt-1 w-full border border-steel-800/15 rounded-lg px-3 py-2 text-sm"
            >
              <option value="engineer">Ingeniero</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          {error && <p className="md:col-span-4 text-sm text-signal-dark">{error}</p>}
          <button type="submit" className="md:col-span-4 bg-steel-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg w-fit">
            Crear usuario
          </button>
        </form>
      )}

      <div className="panel-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-steel-950 text-white text-left font-mono text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel-500">
                  Cargando...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-steel-800/5">
                  <td className="px-4 py-3 font-medium text-steel-900">{user.full_name}</td>
                  <td className="px-4 py-3 text-steel-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border border-steel-800/15 rounded-lg px-2 py-1.5 text-xs"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-1 rounded ${user.is_active ? 'bg-blueprint-light text-blueprint' : 'bg-signal-light text-signal-dark'
                        }`}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleStatusToggle(user)}
                      className="text-xs font-semibold text-blueprint hover:underline"
                    >
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}