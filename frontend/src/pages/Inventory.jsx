import { useEffect, useRef, useState } from 'react';
import apiClient from '../lib/api';
import ConfirmDialog from '../components/common/ConfirmDialog';

const EMPTY_ITEM = {
  code: '',
  name: '',
  category: '',
  unit: 'UND',
  quantity: 0,
  min_stock: 0,
  unit_price: 0,
  warehouse_location: '',
  project_id: '',
  notes: '',
  image_url: '',
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);

  async function loadItems() {
    setLoading(true);
    const { data } = await apiClient.get('/inventory', { params: { search: search || undefined } });
    setItems(data.items);
    setLoading(false);
  }

  async function loadProjects() {
    const { data } = await apiClient.get('/projects');
    setProjects(data.projects);
  }

  useEffect(() => {
    loadItems();
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadItems();
  }

  async function handleSaveItem(item, imageFile) {
    const payload = { ...item, project_id: item.project_id || null };
    let saved;

    if (payload.id) {
      const { data } = await apiClient.put(`/inventory/${payload.id}`, payload);
      saved = data.item;
    } else {
      const { data } = await apiClient.post('/inventory', payload);
      saved = data.item;
    }

    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      await apiClient.post(`/inventory/${saved.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    setModalItem(null);
    loadItems();
  }

  function askDelete(item) {
    setItemToDelete(item);
  }

  async function confirmDelete() {
    await apiClient.delete(`/inventory/${itemToDelete.id}`);
    setItemToDelete(null);
    loadItems();
  }

  async function handleDownload() {
    const response = await apiClient.get('/inventory/export/excel', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventario-insulog.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/inventory/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setImportResult(data);
    event.target.value = '';
    loadItems();
  }

  const lowStockCount = items.filter((item) => Number(item.quantity) <= Number(item.min_stock)).length;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Inventario</p>
          <h1 className="font-display text-3xl text-steel-900">Materiales y suministros</h1>
          {lowStockCount > 0 && (
            <p className="text-xs text-alert font-semibold mt-1">
              {lowStockCount} item(s) por debajo del stock minimo
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="border border-steel-800 text-steel-800 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-steel-800 hover:text-white transition-colors"
          >
            Descargar Excel
          </button>
          <input type="file" accept=".xlsx" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-steel-800 text-steel-800 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-steel-800 hover:text-white transition-colors"
          >
            Subir Excel
          </button>
          <button
            onClick={() => setModalItem({ ...EMPTY_ITEM })}
            className="bg-signal text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-signal-dark transition-colors"
          >
            Agregar item
          </button>
        </div>
      </div>

      {importResult && (
        <div className="mb-6 border border-blueprint bg-blueprint-light rounded-xl p-4 text-sm">
          <p className="font-semibold text-steel-900">
            Importacion completa: {importResult.imported} item(s) actualizados/creados.
          </p>
          {importResult.skipped?.length > 0 && (
            <p className="text-steel-700 mt-1">
              {importResult.skipped.length} fila(s) omitida(s) por falta de codigo o nombre.
            </p>
          )}
          <button onClick={() => setImportResult(null)} className="text-xs text-blueprint underline mt-2">
            Cerrar
          </button>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por codigo o nombre..."
          className="flex-1 border border-steel-800/15 rounded-lg px-3 py-2 text-sm"
        />
        <button type="submit" className="text-sm font-semibold px-4 py-2 border border-steel-800/15 rounded-lg">
          Buscar
        </button>
      </form>

      <div className="panel-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-steel-950 text-white text-left font-mono text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Imagen</th>
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Stock minimo</th>
              <th className="px-4 py-3">Unidad</th>
              <th className="px-4 py-3">Precio unit.</th>
              <th className="px-4 py-3">Bodega</th>
              <th className="px-4 py-3">Obra</th>
              <th className="px-4 py-3">Notas</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-steel-500">
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-steel-500">
                  No hay items registrados.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const lowStock = Number(item.quantity) <= Number(item.min_stock);
                return (
                  <tr key={item.id} className="border-t border-steel-800/5 hover:bg-concrete-100/60">
                    <td className="px-4 py-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-11 h-11 object-cover rounded border border-steel-800/10"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded border border-dashed border-steel-800/20 flex items-center justify-center text-steel-400">
                          <PhotoPlaceholderIcon />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                    <td className="px-4 py-3 font-medium text-steel-900">{item.name}</td>
                    <td className="px-4 py-3 text-steel-600">{item.category}</td>
                    <td className={`px-4 py-3 font-mono ${lowStock ? 'text-signal font-semibold' : ''}`}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 font-mono text-steel-600">{item.min_stock}</td>
                    <td className="px-4 py-3 text-steel-600">{item.unit}</td>
                    <td className="px-4 py-3 font-mono">${Number(item.unit_price).toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3 text-steel-600">{item.warehouse_location}</td>
                    <td className="px-4 py-3 text-steel-600">{item.projects?.name || '-'}</td>
                    <td className="px-4 py-3 text-steel-600 max-w-[180px] truncate" title={item.notes || ''}>
                      {item.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setModalItem(item)}
                        className="text-xs text-blueprint font-semibold hover:underline mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => askDelete(item)}
                        className="text-xs text-signal font-semibold hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalItem && (
        <ItemModal
          item={modalItem}
          projects={projects}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      )}

      <ConfirmDialog
        open={!!itemToDelete}
        title="Eliminar item"
        message={`¿Seguro que quiere eliminar "${itemToDelete?.name}" del inventario? Esta accion no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}

function ItemModal({ item, projects, onClose, onSave }) {
  const [form, setForm] = useState({ ...item, project_id: item.project_id || '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image_url || '');
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
          {item.id ? 'Editar item' : 'Nuevo item de inventario'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ModalField label="Foto del item">
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Vista previa" className="w-16 h-16 object-cover rounded border border-steel-800/10" />
              ) : (
                <div className="w-16 h-16 rounded border border-dashed border-steel-800/20 flex items-center justify-center text-steel-400">
                  <PhotoPlaceholderIcon />
                </div>
              )}
              <label className="text-xs font-semibold text-blueprint cursor-pointer hover:underline">
                {imagePreview ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </ModalField>

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Codigo">
              <input required value={form.code} onChange={(e) => update('code', e.target.value)} className="input" />
            </ModalField>
            <ModalField label="Unidad">
              <input value={form.unit} onChange={(e) => update('unit', e.target.value)} className="input" />
            </ModalField>
          </div>

          <ModalField label="Nombre">
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="input" />
          </ModalField>

          <ModalField label="Categoria">
            <input value={form.category || ''} onChange={(e) => update('category', e.target.value)} className="input" />
          </ModalField>

          <div className="grid grid-cols-3 gap-4">
            <ModalField label="Cantidad">
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => update('quantity', Number(e.target.value))}
                className="input"
              />
            </ModalField>
            <ModalField label="Stock minimo">
              <input
                type="number"
                value={form.min_stock}
                onChange={(e) => update('min_stock', Number(e.target.value))}
                className="input"
              />
            </ModalField>
            <ModalField label="Precio unitario">
              <input
                type="number"
                value={form.unit_price}
                onChange={(e) => update('unit_price', Number(e.target.value))}
                className="input"
              />
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Bodega / ubicacion">
              <input
                value={form.warehouse_location || ''}
                onChange={(e) => update('warehouse_location', e.target.value)}
                className="input"
              />
            </ModalField>
            <ModalField label="Obra asignada">
              <select
                value={form.project_id || ''}
                onChange={(e) => update('project_id', e.target.value)}
                className="input"
              >
                <option value="">Sin obra asignada</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </ModalField>
          </div>

          <ModalField label="Notas">
            <textarea
              value={form.notes || ''}
              onChange={(e) => update('notes', e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </ModalField>

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

function ModalField({ label, children }) {
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