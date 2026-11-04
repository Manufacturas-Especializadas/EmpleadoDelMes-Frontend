export function LoadingState({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div role="status" className="p-8 text-center text-slate-600">
      {message}
    </div>
  )
}
