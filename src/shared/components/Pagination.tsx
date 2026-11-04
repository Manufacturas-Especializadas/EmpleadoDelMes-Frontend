import { Icon } from './Icon'
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
    <nav aria-label="Paginación" className="pagination">
      <p>{total} registro(s)</p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
          className="secondary"
        >
          <Icon name="left" className="size-4" />
          Anterior
        </button>
        <span role="status">
          Página {pageNumber} de {pages}
        </span>
        <button
          type="button"
          disabled={disabled || pageNumber >= pages}
          onClick={() => onPageChange(pageNumber + 1)}
          className="secondary"
        >
          Siguiente
          <Icon name="right" className="size-4" />
        </button>
      </div>
    </nav>
  )
}
