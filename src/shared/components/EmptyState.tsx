import type { ReactNode } from 'react'
import { Icon } from './Icon'
export function EmptyState({
  title = 'No hay registros para mostrar',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="state-panel" role="status">
      <span className="icon-tile">
        <Icon name="inbox" />
      </span>
      <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-md text-sm leading-6 text-muted">{description}</p>}
      {action}
    </div>
  )
}
