import type { ReactNode } from 'react'
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
    <div className="p-8 text-center" role="status">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
      {action}
    </div>
  )
}
