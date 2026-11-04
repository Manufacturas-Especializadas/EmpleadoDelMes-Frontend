import { useId, type ReactNode } from 'react'
import { useModal } from '@/shared/hooks/useModal'
export function Modal({
  open,
  title,
  children,
  onClose,
  busy = false,
  description,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  busy?: boolean
  description?: string
}) {
  const ref = useModal(open)
  const id = useId()
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      aria-describedby={description ? `${id}-description` : undefined}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg backdrop:bg-slate-950/40"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={id} className="text-xl font-semibold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Cerrar diálogo"
          disabled={busy}
          onClick={onClose}
          className="px-2 py-1"
        >
          ✕
        </button>
      </div>
      {description && (
        <p id={`${id}-description`} className="mt-3 text-slate-600">
          {description}
        </p>
      )}
      <div className="mt-4">{open ? children : null}</div>
    </dialog>
  )
}
