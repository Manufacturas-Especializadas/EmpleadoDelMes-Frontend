import type { ReactNode } from 'react'
import { Icon } from './Icon'
export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="feedback-success">
      <Icon name="check" className="mt-0.5 size-5" />
      <div className="min-w-0 text-sm leading-6">{children}</div>
    </div>
  )
}
