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

const CATEGORY_COLORS = {
  'Agregados': { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/20' },
  'Cementos': { bg: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500/20' },
  'Acero': { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/20' },
  'Maquinaria': { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500/20' },
  'Herramientas': { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/20' },
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);

  async function loadItems() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/inventory', { params: { search: search || undefined } });
      setItems(data.items || []);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const { data } = await apiClient.get('/projects');
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error cargando proyectos:', err);
    }
  }

  useEffect(() => {
    loadItems();
    loadProjects();
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

  const lowStockItems = items.filter((item) => Number(item.quantity) <= Number(item.min_stock));
  const totalValuation = items.reduce((acc, curr) => acc + (Number(curr.quantity || 0) * Number(curr.unit_price || 0)), 0);
  const totalUnits = items.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);

  const filteredItems = items.filter((item) => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'LOW_STOCK') return Number(item.quantity) <= Number(item.min_stock);
    return item.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            Módulo 01 // Suministros & Stock Cantera
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-sans">
            Control de Inventario & Materiales
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Gestión técnica de volúmenes, densidades, precios unitarios y asignación a frentes de obra activos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:border-slate-400"
          >
            <DownloadIcon className="w-4 h-4 text-slate-500" />
            <span>Exportar Excel</span>
          </button>

          <input type="file" accept=".xlsx" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:border-slate-400"
          >
            <UploadIcon className="w-4 h-4 text-slate-500" />
            <span>Importar Planilla</span>
          </button>

          <button
            onClick={() => setModalItem({ ...EMPTY_ITEM })}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Registrar Material</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Referencias</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-slate-950 font-mono">{loading ? '—' : items.length}</p>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">SKUs activos</span>
          </div>
        </div>

        <div className={`rounded-xl p-5 border shadow-sm relative overflow-hidden transition-colors ${lowStockItems.length > 0 ? 'bg-orange-50/60 border-orange-200' : 'bg-white border-slate-200/90'
          }`}>
          <div className={`absolute top-0 left-0 right-0 h-1 ${lowStockItems.length > 0 ? 'bg-orange-600' : 'bg-emerald-500'}`} />
          <p className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${lowStockItems.length > 0 ? 'text-orange-700' : 'text-slate-400'
            }`}>
            Bajo Stock Mínimo
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className={`text-3xl font-extrabold font-mono ${lowStockItems.length > 0 ? 'text-orange-600' : 'text-emerald-700'}`}>
              {loading ? '—' : lowStockItems.length}
            </p>
            {lowStockItems.length > 0 ? (
              <span className="text-xs font-mono font-bold text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded animate-pulse">
                Acción urgente
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Nivel óptimo</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Existencias Físicas</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-slate-950 font-mono">
              {loading ? '—' : totalUnits.toLocaleString('es-CO')}
            </p>
            <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">M³ / Ton / Und</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Valoración en Bodega</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl lg:text-3xl font-extrabold text-slate-950 font-mono">
              ${loading ? '—' : totalValuation.toLocaleString('es-CO')}
            </p>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase font-semibold">COP</span>
          </div>
        </div>
      </div>

      {importResult && (
        <div className="border border-blue-200 bg-blue-50/70 rounded-xl p-4 text-sm flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-bold text-slate-900">
                Importación procesada: {importResult.imported} ítem(s) actualizados o creados con éxito.
              </p>
              {importResult.skipped?.length > 0 && (
                <p className="text-slate-600 text-xs mt-1">
                  {importResult.skipped.length} fila(s) omitida(s) por falta de código o nombre obligatorio.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 uppercase font-mono px-2 py-1 bg-white rounded border border-blue-200"
          >
            Descartar
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all ${categoryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Todos ({items.length})
          </button>

          {lowStockItems.length > 0 && (
            <button
              onClick={() => setCategoryFilter('LOW_STOCK')}
              className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${categoryFilter === 'LOW_STOCK'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Bajo Stock ({lowStockItems.length})
            </button>
          )}

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all ${categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, material..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4 font-semibold w-16 text-center">Ficha</th>
                <th className="py-3.5 px-4 font-semibold">Código</th>
                <th className="py-3.5 px-4 font-semibold">Material / Suministro</th>
                <th className="py-3.5 px-4 font-semibold">Categoría</th>
                <th className="py-3.5 px-4 font-semibold text-right">Existencia</th>
                <th className="py-3.5 px-4 font-semibold text-right">Mínimo</th>
                <th className="py-3.5 px-4 font-semibold">Unidad</th>
                <th className="py-3.5 px-4 font-semibold text-right">Precio Unit.</th>
                <th className="py-3.5 px-4 font-semibold">Ubicación / Acopio</th>
                <th className="py-3.5 px-4 font-semibold">Obra Asignada</th>
                <th className="py-3.5 px-4 font-semibold text-center w-28">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                      <p className="font-mono text-xs uppercase text-slate-500 tracking-wider">Cargando inventario...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-3xl">📦</p>
                      <p className="font-bold text-slate-800 text-sm">No se encontraron materiales registrados</p>
                      <p className="text-xs text-slate-500">
                        {search ? 'Intente modificando los términos de búsqueda o filtros.' : 'Comience registrando su primer material con el botón superior.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = Number(item.quantity) <= Number(item.min_stock);
                  const catStyle = CATEGORY_COLORS[item.category] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-xs mx-auto"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 mx-auto group-hover:border-slate-400 transition-colors">
                            <BoxIcon className="w-4 h-4 opacity-70" />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tracking-tight">
                        <span className="bg-slate-100 border border-slate-200/80 px-2 py-1 rounded text-[11px]">
                          {item.code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                        {item.notes && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs font-normal" title={item.notes}>
                            {item.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {item.category ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {item.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <div className="inline-flex items-center gap-1.5">
                          {isLow && (
                            <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" title="Bajo stock mínimo" />
                          )}
                          <span className={isLow ? 'text-orange-600 font-extrabold' : 'text-slate-900'}>
                            {Number(item.quantity).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {Number(item.min_stock).toLocaleString('es-CO')}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 uppercase font-semibold">
                        {item.unit}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-900 font-medium">
                        ${Number(item.unit_price).toLocaleString('es-CO')}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">📍</span>
                          <span>{item.warehouse_location || 'Cantera Principal'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {item.projects?.name ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-[11px]">
                            <span>🏗️</span>
                            <span className="truncate max-w-[130px]">{item.projects.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">En patio central</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setModalItem(item)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Editar especificación"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => askDelete(item)}
                            className="p-1.5 rounded-md hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors"
                            title="Eliminar de inventario"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <span>Mostrando {filteredItems.length} de {items.length} materiales registrados</span>
          <span className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-600" /> Requiere abastecimiento
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stock disponible
            </span>
          </span>
        </div>
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
        title="Eliminar material"
        message={`¿Seguro que quiere eliminar "${itemToDelete?.name}" (${itemToDelete?.code}) del inventario? Esta acción no se puede deshacer.`}
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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange-600 font-bold">Ficha Técnica</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              {item.id ? 'Editar Material' : 'Nuevo Material de Obra'}
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
              <img src={imagePreview} alt="Vista previa" className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs" />
            ) : (
              <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                <BoxIcon className="w-6 h-6 opacity-60" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">Fotografía del Material</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Muestra representativa de cantera o certificado.</p>
              <label className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 cursor-pointer hover:underline">
                <span>{imagePreview ? 'Cambiar imagen' : '+ Cargar archivo'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Código SKU / Norma">
              <input
                required
                placeholder="Ej. MAT-BG1-01"
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                className="modal-input font-mono uppercase"
              />
            </ModalField>
            <ModalField label="Unidad de Medida">
              <select
                value={form.unit}
                onChange={(e) => update('unit', e.target.value)}
                className="modal-input font-mono"
              >
                <option value="M3">M3 (Metro Cúbico)</option>
                <option value="TON">TON (Tonelada)</option>
                <option value="VIAJE">VIAJE (Volqueta)</option>
                <option value="UND">UND (Unidad)</option>
                <option value="BTO">BTO (Bulto)</option>
                <option value="KG">KG (Kilogramo)</option>
                <option value="ML">ML (Metro Lineal)</option>
              </select>
            </ModalField>
          </div>

          <ModalField label="Nombre del Material / Suministro">
            <input
              required
              placeholder="Ej. Base Granular BG-1 (Norma INVIAS Art. 300)"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="modal-input font-semibold"
            />
          </ModalField>

          <ModalField label="Categoría de Operación">
            <input
              placeholder="Ej. Agregados, Cementos, Acero, Maquinaria"
              value={form.category || ''}
              onChange={(e) => update('category', e.target.value)}
              className="modal-input"
            />
          </ModalField>

          <div className="grid grid-cols-3 gap-3">
            <ModalField label="Stock Actual">
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => update('quantity', Number(e.target.value))}
                className="modal-input font-mono font-bold"
              />
            </ModalField>
            <ModalField label="Stock Mínimo">
              <input
                type="number"
                value={form.min_stock}
                onChange={(e) => update('min_stock', Number(e.target.value))}
                className="modal-input font-mono"
              />
            </ModalField>
            <ModalField label="Precio Unit. (COP)">
              <input
                type="number"
                value={form.unit_price}
                onChange={(e) => update('unit_price', Number(e.target.value))}
                className="modal-input font-mono"
              />
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Ubicación / Frente de Acopio">
              <input
                placeholder="Ej. Cantera Central La Belleza"
                value={form.warehouse_location || ''}
                onChange={(e) => update('warehouse_location', e.target.value)}
                className="modal-input"
              />
            </ModalField>
            <ModalField label="Obra Asignada (Opcional)">
              <select
                value={form.project_id || ''}
                onChange={(e) => update('project_id', e.target.value)}
                className="modal-input"
              >
                <option value="">Patio Central General</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </ModalField>
          </div>

          <ModalField label="Notas Técnicas y Observaciones">
            <textarea
              placeholder="Ensayos de laboratorio, curvas granulométricas, densidad aparente..."
              value={form.notes || ''}
              onChange={(e) => update('notes', e.target.value)}
              rows={2}
              className="modal-input resize-none"
            />
          </ModalField>

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
              {saving ? 'Guardando...' : 'Guardar Material'}
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

function ModalField({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
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

function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

function BoxIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
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