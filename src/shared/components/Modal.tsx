import { Icon } from './Icon'
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
      className="modal-shell"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <h2 id={id} className="text-xl font-semibold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Cerrar diálogo"
          disabled={busy}
          onClick={onClose}
          className="icon-button"
        >
          <Icon name="close" />
        </button>
      </div>
      {description && (
        <p id={`${id}-description`} className="mt-4 text-sm leading-6 text-muted">
          {description}
        </p>
      )}
      <div className="mt-5">{open ? children : null}</div>
    </dialog>
  )
}
