export type SkeletonVariant = 'table' | 'cards' | 'header' | 'detail'
/** Static placeholders avoid distracting pulses and stay quiet for screen readers. */
export function Skeleton({ variant = 'detail' }: { variant?: SkeletonVariant }) {
  return (
    <div aria-hidden="true" className="mt-5">
      {variant === 'table' ? (
        <div className="space-y-5">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="grid grid-cols-3 gap-6 border-b border-border pb-4">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : variant === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((card) => (
            <div key={card} className="space-y-4 rounded-panel border border-border p-5">
              <div className="skeleton size-10" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="skeleton h-5 w-1/2" />
          <div className="skeleton h-3 w-4/5" />
          {variant === 'detail' && (
            <>
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton mt-6 h-16 w-full" />
            </>
          )}
        </div>
      )}
    </div>
  )
}
