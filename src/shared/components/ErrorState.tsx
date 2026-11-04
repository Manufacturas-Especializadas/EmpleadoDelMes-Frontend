import { Icon } from './Icon'
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="state-panel border-red-200">
      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <Icon name="alert" />
      </span>
      <h2 className="text-base font-semibold">No pudimos completar la consulta</h2>
      <p className="max-w-lg text-sm leading-6 text-danger">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="secondary mt-2">
          <Icon name="refresh" />
          Reintentar
        </button>
      )}
    </div>
  )
}
