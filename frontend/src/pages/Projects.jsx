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

const STATUS_LABELS = {
  planning: 'En planeacion',
  in_progress: 'En ejecucion',
  paused: 'Pausada',
  finished: 'Finalizada',
};

const STATUS_BAR = {
  planning: 'bg-blueprint',
  in_progress: 'bg-signal',
  paused: 'bg-alert',
  finished: 'bg-concrete-400',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProject, setModalProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  async function loadProjects() {
    setLoading(true);
    const { data } = await apiClient.get('/projects');
    setProjects(data.projects);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  // Saves the obra first, then (if a new image was picked) uploads it
  // using the obra's id, so brand new obras can get an image on creation too.
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

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Obras</p>
          <h1 className="font-display text-3xl text-steel-900">Control de obras</h1>
        </div>
        <button
          onClick={() => setModalProject({ ...EMPTY_PROJECT })}
          className="bg-signal text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-signal-dark transition-colors"
        >
          Nueva obra
        </button>
      </div>

      {loading ? (
        <p className="text-steel-500 text-sm">Cargando...</p>
      ) : projects.length === 0 ? (
        <p className="text-steel-500 text-sm">Aun no hay obras registradas.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="panel-card overflow-hidden">
              {project.image_url ? (
                <img src={project.image_url} alt={project.name} className="w-full h-36 object-cover" />
              ) : (
                <div className={`h-1 ${STATUS_BAR[project.status]}`} />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-xl text-steel-900">{project.name}</p>
                    <p className="text-xs text-steel-600">{project.location}</p>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wide px-2 py-1 rounded bg-blueprint-light text-blueprint">
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>
                {project.client_name && (
                  <p className="text-sm text-steel-700 mt-3">Cliente: {project.client_name}</p>
                )}
                {project.description && (
                  <p className="text-sm text-steel-600 mt-2 line-clamp-3">{project.description}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setModalProject(project)}
                    className="text-xs text-blueprint font-semibold hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => askDelete(project)}
                    className="text-xs text-signal font-semibold hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalProject && (
        <ProjectModal project={modalProject} onClose={() => setModalProject(null)} onSave={handleSave} />
      )}

      <ConfirmDialog
        open={!!projectToDelete}
        title="Eliminar obra"
        message={`¿Seguro que quiere eliminar la obra "${projectToDelete?.name}"? Esta accion no se puede deshacer.`}
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
    <div className="fixed inset-0 bg-steel-900/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl shadow-panel max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-2xl text-steel-900 mb-5">
          {project.id ? 'Editar obra' : 'Nueva obra'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Foto de la obra (opcional)">
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-20 h-16 object-cover rounded-lg border border-steel-800/10"
                />
              ) : (
                <div className="w-20 h-16 rounded-lg border border-dashed border-steel-800/20 flex items-center justify-center text-steel-400">
                  <PhotoPlaceholderIcon />
                </div>
              )}
              <label className="text-xs font-semibold text-blueprint cursor-pointer hover:underline">
                {imagePreview ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </Field>

          <Field label="Nombre de la obra">
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente">
              <input value={form.client_name || ''} onChange={(e) => update('client_name', e.target.value)} className="input" />
            </Field>
            <Field label="Ubicacion">
              <input value={form.location || ''} onChange={(e) => update('location', e.target.value)} className="input" />
            </Field>
          </div>

          <Field label="Estado">
            <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha inicio">
              <input type="date" value={form.start_date || ''} onChange={(e) => update('start_date', e.target.value)} className="input" />
            </Field>
            <Field label="Fecha fin estimada">
              <input type="date" value={form.end_date || ''} onChange={(e) => update('end_date', e.target.value)} className="input" />
            </Field>
          </div>

          <Field label="Descripcion">
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input resize-none"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm font-semibold px-4 py-2.5 text-steel-700">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-signal text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-signal-dark disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(27,42,56,0.15);
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function PhotoPlaceholderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 15l-5-5-9 9" />
    </svg>
  );
}