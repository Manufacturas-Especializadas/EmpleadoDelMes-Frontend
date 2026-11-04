export function Pagination({
  pageNumber,
  pageSize,
  total,
  onPageChange,
  disabled = false,
}: {
  pageNumber: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-sm"
    >
      <p>{total} registro(s)</p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
          className="border border-slate-300 px-3 py-2"
        >
          Anterior
        </button>
        <span role="status">
          Página {pageNumber} de {pages}
        </span>
        <button
          type="button"
          disabled={disabled || pageNumber >= pages}
          onClick={() => onPageChange(pageNumber + 1)}
          className="border border-slate-300 px-3 py-2"
        >
          Siguiente
        </button>
      </div>
    </nav>
  )
}
