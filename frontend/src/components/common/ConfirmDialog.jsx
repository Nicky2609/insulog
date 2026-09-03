export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-steel-900/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl shadow-panel max-w-sm w-full p-6">
        <h2 className="font-display text-xl text-steel-900 mb-2">{title}</h2>
        <p className="text-sm text-steel-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm font-semibold px-4 py-2.5 text-steel-700 hover:bg-concrete-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-signal text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-signal-dark"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}