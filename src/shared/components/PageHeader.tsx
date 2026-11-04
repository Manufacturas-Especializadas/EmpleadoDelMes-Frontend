import type { ReactNode } from 'react'
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
      </div>
      {actions}
    </header>
  )
}
