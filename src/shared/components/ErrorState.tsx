export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="p-8 text-center">
      <p className="font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-sm font-semibold text-teal-800 hover:underline"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
