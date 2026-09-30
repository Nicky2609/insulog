import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

/* ============================================================
   CONSTANTES DE ROLES
   ============================================================ */
const ROLE_LABELS = {
  admin: 'Administrador',
  engineer: 'Ingeniero Residente',
};

const ROLE_BADGES = {
  admin: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200/80',
    dot: 'bg-orange-600',
    label: 'Administrador',
  },
  engineer: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-600',
    label: 'Ingeniero de Obra',
  },
};

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role: 'engineer',
};

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function Users() {
  /* ----- Estado ----- */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  /* ----- Carga de datos ----- */
  async function loadUsers() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* ----- Handlers ----- */
  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await apiClient.post('/users', form);
      setForm(EMPTY_FORM);
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'No fue posible registrar el nuevo usuario.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(id, role) {
    try {
      await apiClient.put(`/users/${id}/role`, { role });
      loadUsers();
    } catch (err) {
      console.error('Error actualizando rol:', err);
    }
  }

  async function handleStatusToggle(user) {
    try {
      await apiClient.put(`/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      loadUsers();
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  }

  /* ----- Métricas derivadas ----- */
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const engineerCount = users.filter((u) => u.role === 'engineer').length;

  /* ----- Filtrado reactivo ----- */
  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesSearch =
      !search ||
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  /* ----- Render ----- */
  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
      {/* =========================================================
          ENCABEZADO EDITORIAL
          ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            Módulo 04 // Gobierno de Datos & Equipo Técnico
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-sans">
            Usuarios, Roles & Privilegios
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Control perimetral de credenciales, ingenieros autorizados y
            asignación de permisos sobre el sistema Insulog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setError('');
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Crear Usuario de Staff</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          KPI TILES
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          accent="bg-slate-900"
          label="Cuentas Registradas"
          value={loading ? '—' : totalUsers}
          badge="Staff total"
          badgeClass="text-slate-500 bg-slate-100"
          labelClass="text-slate-400"
          valueClass="text-slate-950"
        />
        <StatTile
          accent="bg-emerald-500"
          label="Accesos Habilitados"
          value={loading ? '—' : activeUsers}
          badge="En servicio activo"
          badgeClass="text-emerald-700 bg-emerald-50 border border-emerald-200"
          labelClass="text-emerald-700"
          valueClass="text-emerald-700"
        />
        <StatTile
          accent="bg-blue-600"
          label="Ingenieros de Campo"
          value={loading ? '—' : engineerCount}
          badge="Frentes e inventario"
          badgeClass="text-blue-700 bg-blue-50"
          labelClass="text-slate-400"
          valueClass="text-slate-950"
        />
        <StatTile
          accent="bg-orange-600"
          label="Administradores Clave"
          value={loading ? '—' : adminCount}
          badge="Control total"
          badgeClass="text-orange-700 bg-orange-50"
          labelClass="text-orange-700"
          valueClass="text-orange-600"
        />
      </div>

      {/* =========================================================
          BARRA DE CONTROL: BÚSQUEDA & FILTRO
          ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <FilterButton
            active={filterRole === 'ALL'}
            onClick={() => setFilterRole('ALL')}
            activeClass="bg-slate-900 text-white shadow-sm"
            inactiveClass="bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Todos ({users.length})
          </FilterButton>

          <FilterButton
            active={filterRole === 'engineer'}
            onClick={() => setFilterRole('engineer')}
            activeClass="bg-blue-600 text-white shadow-sm"
            inactiveClass="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            dot="bg-blue-600"
          >
            Ingenieros ({engineerCount})
          </FilterButton>

          <FilterButton
            active={filterRole === 'admin'}
            onClick={() => setFilterRole('admin')}
            activeClass="bg-orange-600 text-white shadow-sm"
            inactiveClass="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
            dot="bg-orange-600"
          >
            Administradores ({adminCount})
          </FilterButton>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo corporativo..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* =========================================================
          TABLA DE USUARIOS
          ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4 font-semibold w-12 text-center">#</th>
                <th className="py-3.5 px-4 font-semibold">Funcionario / Staff</th>
                <th className="py-3.5 px-4 font-semibold">Correo Electrónico</th>
                <th className="py-3.5 px-4 font-semibold">Rol Asignado</th>
                <th className="py-3.5 px-4 font-semibold">Estado de Cuenta</th>
                <th className="py-3.5 px-4 font-semibold text-center w-36">
                  Acciones de Seguridad
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                      <p className="font-mono text-xs uppercase text-slate-500 tracking-wider">
                        Cargando directorio de usuarios...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-slate-500"
                  >
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-3xl">👥</p>
                      <p className="font-bold text-slate-900 text-sm">
                        No se encontraron usuarios
                      </p>
                      <p className="text-xs text-slate-500">
                        {search
                          ? 'Intente modificando los términos de búsqueda o filtros.'
                          : 'Comience registrando su primer usuario con el botón superior.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    onStatusToggle={handleStatusToggle}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <span>
            Mostrando {filteredUsers.length} de {users.length} miembros del staff
          </span>
          <span className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />{' '}
              Autenticación habilitada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Bloqueado
              preventivamente
            </span>
          </span>
        </div>
      </div>

      {/* =========================================================
          MODAL DE REGISTRO DE USUARIO
          ========================================================= */}
      {showModal && (
        <UserModal
          form={form}
          setForm={setForm}
          error={error}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES
   ============================================================ */

function UserRow({ user, onRoleChange, onStatusToggle }) {
  const roleStyle = ROLE_BADGES[user.role] || ROLE_BADGES.engineer;
  const initials = user.full_name
    ? user.full_name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'US';

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto border border-slate-700 shadow-xs">
          {initials}
        </div>
      </td>

      <td className="py-3 px-4">
        <p className="font-bold text-slate-900 text-sm">{user.full_name}</p>
        <p className="font-mono text-[10px] text-slate-400 uppercase">
          ID: #{user.id}
        </p>
      </td>

      <td className="py-3 px-4 font-mono text-slate-600">
        <div className="flex items-center gap-1.5">
          <MailIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>{user.email}</span>
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="inline-flex items-center gap-2">
          <select
            value={user.role}
            onChange={(e) => onRoleChange(user.id, e.target.value)}
            className={`border rounded-lg px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-600 cursor-pointer ${roleStyle.badge}`}
          >
            <option value="engineer">Ingeniero</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </td>

      <td className="py-3 px-4">
        {user.is_active ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Inactivo
          </span>
        )}
      </td>

      <td className="py-3 px-4 text-center">
        <button
          onClick={() => onStatusToggle(user)}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${user.is_active
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300'
            }`}
        >
          {user.is_active ? 'Revocar Acceso' : 'Habilitar Acceso'}
        </button>
      </td>
    </tr>
  );
}

function UserModal({ form, setForm, error, saving, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange-600 font-bold">
              Credencial de Staff
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              Nuevo Usuario de Equipo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <ModalField label="Nombre Completo del Funcionario">
            <input
              required
              placeholder="Ej. Ing. Carlos Alberto Mendoza"
              value={form.full_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, full_name: e.target.value }))
              }
              className="modal-input font-semibold"
            />
          </ModalField>

          <ModalField label="Correo Corporativo / Acceso">
            <input
              required
              type="email"
              placeholder="cmendoza@insulog.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className="modal-input font-mono"
            />
          </ModalField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalField label="Rol y Nivel de Privilegio">
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                className="modal-input font-mono font-medium"
              >
                <option value="engineer">Ingeniero de Obra</option>
                <option value="admin">Administrador Global</option>
              </select>
            </ModalField>

            <ModalField label="Contraseña Temporal Inicial">
              <input
                required
                type="text"
                placeholder="Generar clave provisional"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="modal-input font-mono"
              />
            </ModalField>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
            <span className="text-base">🔐</span>
            <span>
              <strong>Política de Primer Acceso:</strong> El sistema exigirá
              obligatoriamente el cambio de contraseña al funcionario la primera
              vez que inicie sesión en la plataforma.
            </span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-mono text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Registrando...' : 'Registrar Credencial'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-input {
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.8125rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }
        .modal-input:focus {
          background-color: #ffffff;
          border-color: #ea580c;
          box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.15);
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   COMPONENTES UI AUXILIARES
   ============================================================ */

function StatTile({
  accent,
  label,
  value,
  badge,
  badgeClass,
  labelClass,
  valueClass,
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />
      <p
        className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${labelClass}`}
      >
        {label}
      </p>
      <div className="flex items-baseline justify-between mt-2">
        <p className={`text-3xl font-extrabold font-mono ${valueClass}`}>
          {value}
        </p>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${badgeClass}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  activeClass,
  inactiveClass,
  dot,
  children,
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${active ? activeClass : inactiveClass
        }`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {children}
    </button>
  );
}

function ModalField({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

/* ============================================================
   ICONOS SVG
   ============================================================ */

function SearchIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UserPlusIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}