import React from 'react';

function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card-dark p-6 shadow-2xl">
        <h3 className="text-xl font-black uppercase tracking-wide text-white">{title}</h3>
        <p className="mt-3 text-sm text-gray-300">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-hover rounded-xl border border-white/10 px-4 py-2 font-bold text-gray-200 hover:bg-white/5 disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-hover on-accent rounded-xl bg-red-700 px-4 py-2 font-bold hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
