import { Modal } from './Modal'
export function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  busy = false,
  error,
  confirmLabel = 'Confirmar',
  destructive = false,
}: {
  open: boolean
  title: string
  description: string
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
  error?: string
  confirmLabel?: string
  destructive?: boolean
}) {
  return (
    <Modal open={open} title={title} description={description} onClose={onCancel} busy={busy}>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button type="button" autoFocus disabled={busy} onClick={onCancel} className="secondary">
          Cancelar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={destructive ? 'danger' : 'primary'}
        >
          {busy ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
