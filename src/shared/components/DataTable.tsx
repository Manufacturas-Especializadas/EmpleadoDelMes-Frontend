import type { Key, ReactNode } from 'react'
import { EmptyState } from './EmptyState'
export interface Column<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
}
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  caption,
  emptyState,
}: {
  rows: readonly T[]
  columns: readonly Column<T>[]
  rowKey: (row: T) => Key
  caption: string
  emptyState?: ReactNode
}) {
  if (!rows.length) return emptyState ?? <EmptyState />
  return (
    <div className="surface-panel overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.id}>{column.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
