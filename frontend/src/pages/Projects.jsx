import { useEffect, useState } from 'react';
import apiClient from '../lib/api';
import ConfirmDialog from '../components/common/ConfirmDialog';

const EMPTY_PROJECT = {
  name: '',
  client_name: '',
  location: '',
  status: 'planning',
  start_date: '',
  end_date: '',
  description: '',
  image_url: '',
};

const STATUS_CONFIG = {
  planning: {
    label: 'En Planeación',
    badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
  },
  in_progress: {
    label: 'En Ejecución',
    badge: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    bar: 'bg-orange-600',
    dot: 'bg-orange-600 animate-pulse',
  },
  paused: {
    label: 'Pausada',
    badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
  },
  finished: {
    label: 'Liquidada / Finalizada',
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    bar: 'bg-emerald-600',
    dot: 'bg-emerald-600',
  },
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalProject, setModalProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  async function loadProjects() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/projects');
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error cargando obras:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleSave(project, imageFile) {
    let saved;

    if (project.id) {
      const { data } = await apiClient.put(`/projects/${project.id}`, project);
      saved = data.project;
    } else {
      const { data } = await apiClient.post('/projects', project);
      saved = data.project;
    }

    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      await apiClient.post(`/projects/${saved.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    setModalProject(null);
    loadProjects();
  }

  function askDelete(project) {
    setProjectToDelete(project);
  }

  async function confirmDelete() {
    await apiClient.delete(`/projects/${projectToDelete.id}`);
    setProjectToDelete(null);
    loadProjects();
  }

  // Métricas calculadas
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');
  const planningProjects = projects.filter((p) => p.status === 'planning');
  const finishedProjects = projects.filter((p) => p.status === 'finished');

  // Filtrado reactivo
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
      {/* =========================================================
          ENCABEZADO EDITORIAL DE INGENIERÍA
      ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            Módulo 02 // Frentes de Obra & Infraestructura
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-sans">
            Control de Obras & Proyectos
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Supervisión técnica, replanteo de cronogramas, comisiones topográficas y frentes activos en Santander y Boyacá.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalProject({ ...EMPTY_PROJECT })}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Registrar Nueva Obra</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TILES DE MÉTRICAS OPERATIVAS (KPI TILES)
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Obras */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Contratos / Obras</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-slate-950 font-mono">{loading ? '—' : projects.length}</p>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Proyectos registrados</span>
          </div>
        </div>

        {/* En Ejecución */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-600" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-orange-700 font-semibold">Frentes en Ejecución</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-orange-600 font-mono">{loading ? '—' : inProgressProjects.length}</p>
            <span className="text-xs font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded animate-pulse">
              Maquinaria activa
            </span>
          </div>
        </div>

        {/* En Planeación */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">En Planeación / Estudios</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-slate-950 font-mono">{loading ? '—' : planningProjects.length}</p>
            <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Diseños y licencias</span>
          </div>
        </div>

        {/* Finalizadas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Obras Entregadas</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-emerald-700 font-mono">{loading ? '—' : finishedProjects.length}</p>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">100% Recibidas</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          BARRA DE FILTROS & BÚSQUEDA RÁPIDA
      ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all ${statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Todas ({projects.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${statusFilter === 'in_progress'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
            En Ejecución ({inProgressProjects.length})
          </button>
          <button
            onClick={() => setStatusFilter('planning')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all ${statusFilter === 'planning'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Planeación ({planningProjects.length})
          </button>
          <button
            onClick={() => setStatusFilter('finished')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all ${statusFilter === 'finished'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Entregadas ({finishedProjects.length})
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
            placeholder="Buscar por obra, cliente, municipio..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* =========================================================
          REJILLA EDITORIAL DE TARJETAS TÉCNICAS DE OBRA
      ========================================================= */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-xs uppercase text-slate-500 tracking-wider">Cargando frentes de obra...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 p-6">
          <div className="max-w-sm mx-auto space-y-2">
            <p className="text-4xl">🏗️</p>
            <p className="font-bold text-slate-900 text-base">No se encontraron obras registradas</p>
            <p className="text-xs text-slate-500">
              {search ? 'Intente modificando los términos de búsqueda o los filtros de estado.' : 'Comience registrando su primer proyecto con el botón superior.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Imagen de Portada de Obra o Placeholder Técnico */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-900 to-slate-950">
                        <BlueprintPattern />
                        <BuildingIcon className="w-10 h-10 opacity-30 text-white z-10" />
                        <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase mt-2 z-10">
                          Registro Fotográfico Pendiente
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Badge de Estado Flotante */}
                    <div className="absolute top-3 right-3 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${statusCfg.badge} bg-white/95 shadow-xs`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Ubicación al pie de la foto */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 text-white flex items-center gap-1.5 text-xs">
                      <MapPinIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="font-medium truncate">{project.location || 'Localización sin especificar'}</span>
                    </div>
                  </div>

                  {/* Barra de Acento de Estado */}
                  <div className={`h-1 w-full ${statusCfg.bar}`} />

                  {/* Contenido Editorial */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                        {project.name}
                      </h3>
                      {project.client_name && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <span className="font-mono text-[10px] uppercase text-slate-400 font-semibold">Cliente:</span>
                          <span className="font-medium text-slate-700">{project.client_name}</span>
                        </p>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {project.description}
                      </p>
                    )}

                    {/* Línea de Tiempo / Fechas de Interventoría */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">Inicio:</span>
                        <span className="text-slate-700 font-medium">{project.start_date || 'Por definir'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">Entrega Est.:</span>
                        <span className="text-slate-700 font-medium">{project.end_date || 'Por definir'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer de Acciones */}
                <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase">
                    ID-OBRA #{project.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalProject(project)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                      title="Editar especificación de obra"
                    >
                      <EditIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => askDelete(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      title="Eliminar obra"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          MODAL TÉCNICO DE REGISTRO / EDICIÓN DE OBRA
      ========================================================= */}
      {modalProject && (
        <ProjectModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onSave={handleSave}
        />
      )}

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        open={!!projectToDelete}
        title="Eliminar Obra del Sistema"
        message={`¿Seguro que desea eliminar el registro de la obra "${projectToDelete?.name}"? Esta acción desvinculará los materiales y reportes asociados.`}
        onConfirm={confirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}

function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(project.image_url || '');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(form, imageFile);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange-600 font-bold">Ficha de Obra</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              {project.id ? 'Editar Especificación de Obra' : 'Nuevo Frente de Obra Civil'}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Vista previa de obra" className="w-20 h-16 object-cover rounded-lg border border-slate-300 shadow-xs" />
            ) : (
              <div className="w-20 h-16 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                <BuildingIcon className="w-6 h-6 opacity-50" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">Registro Fotográfico del Frente</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Fotografía de avance, replanteo o hito de pavimentación.</p>
              <label className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 cursor-pointer hover:underline">
                <span>{imagePreview ? 'Cambiar fotografía' : '+ Cargar fotografía'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <Field label="Nombre Completo de la Obra o Contrato">
            <input
              required
              placeholder="Ej. Pavimentación Placa Huella Vía La Belleza - PK 14+200"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="modal-input font-semibold"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Entidad Contratante / Cliente">
              <input
                placeholder="Ej. Alcaldía La Belleza / Consorcio Vial"
                value={form.client_name || ''}
                onChange={(e) => update('client_name', e.target.value)}
                className="modal-input"
              />
            </Field>
            <Field label="Municipio / Localización">
              <input
                placeholder="Ej. La Belleza, Santander"
                value={form.location || ''}
                onChange={(e) => update('location', e.target.value)}
                className="modal-input"
              />
            </Field>
          </div>

          <Field label="Estado Operativo del Frente">
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="modal-input font-mono font-medium"
            >
              <option value="planning">En Planeación / Diseños y Topografía</option>
              <option value="in_progress">En Ejecución Activa (Maquinaria en Sitio)</option>
              <option value="paused">Pausada / Suspensión Temporal</option>
              <option value="finished">Finalizada / Acta de Recibo Definitiva</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha de Acta de Inicio">
              <input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => update('start_date', e.target.value)}
                className="modal-input font-mono text-xs"
              />
            </Field>
            <Field label="Fecha de Entrega Estimada">
              <input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => update('end_date', e.target.value)}
                className="modal-input font-mono text-xs"
              />
            </Field>
          </div>

          <Field label="Alcance Técnico y Observaciones">
            <textarea
              rows={3}
              placeholder="Especificaciones INVIAS, volumen estimado de agregados requeridos, longitud en metros lineales..."
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="modal-input resize-none"
            />
          </Field>

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
              {saving ? 'Guardando...' : 'Guardar Obra'}
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function BlueprintPattern() {
  return (
    <div
      className="absolute inset-0 opacity-15 pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    />
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

function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function MapPinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}