import { useState } from 'react'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
export function PreviewTable<T extends { rowNumber: number }>({
  rows,
  columns,
}: {
  rows: T[]
  columns: Column<T>[]
}) {
  const [page, setPage] = useState(1)
  return (
    <>
      <DataTable
        caption="Filas de la vista previa"
        rows={rows.slice((page - 1) * 50, page * 50)}
        columns={columns}
        rowKey={(row) => row.rowNumber}
      />
      <Pagination pageNumber={page} pageSize={50} total={rows.length} onPageChange={setPage} />
    </>
  )
}
