import { Skeleton, type SkeletonVariant } from './Skeleton'
export function LoadingState({
  message = 'Cargando…',
  variant = 'detail',
}: {
  message?: string
  variant?: SkeletonVariant | 'compact'
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        variant === 'compact'
          ? 'flex items-center gap-3 py-4 text-sm text-muted'
          : 'my-4 rounded-panel border border-border bg-surface p-5'
      }
    >
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="spinner text-primary" aria-hidden="true" />
        {message}
      </div>
      {variant !== 'compact' && <Skeleton variant={variant} />}
    </div>
  )
}
