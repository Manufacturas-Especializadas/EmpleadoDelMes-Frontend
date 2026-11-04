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
    <div className="overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col" className="px-5 py-4 font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0">
              {columns.map((column) => (
                <td key={column.id} className="px-5 py-4 align-top">
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
