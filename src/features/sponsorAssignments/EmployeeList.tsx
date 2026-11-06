import { useState } from 'react'
import { useQuery } from '@/shared/hooks/useQuery'
import { DataTable } from '@/shared/components/DataTable'
import { ListFilters } from '@/shared/components/ListFilters'
import { Pagination } from '@/shared/components/Pagination'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { assignmentsApi, type AssignmentEmployee } from './api'
export function EmployeeList({
  path,
  title,
  onSelect,
  disabled = false,
  exclude = [],
  action = 'Seleccionar',
}: {
  path: string
  title: string
  onSelect: (employee: AssignmentEmployee) => void
  disabled?: boolean
  exclude?: string[]
  action?: string
}) {
  const [filter, setFilter] = useState({ term: '', page: 1 })
  const query = useQuery(JSON.stringify([path, filter]), (signal) =>
    assignmentsApi.list(path, filter.term, filter.page, signal),
  )
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ListFilters onSearch={(term) => setFilter({ term, page: 1 })} />
      {query.loading && <LoadingState variant="table" />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption={title}
            rows={query.data.items}
            rowKey={(row) => row.id}
            columns={[
              { id: 'payroll', header: 'Nómina', cell: (row) => row.payrollNumber },
              { id: 'name', header: 'Nombre', cell: (row) => row.fullName },
              {
                id: 'action',
                header: 'Acción',
                cell: (row) => (
                  <button
                    className="secondary"
                    disabled={disabled || exclude.includes(row.id)}
                    onClick={() => onSelect(row)}
                  >
                    {action}
                  </button>
                ),
              },
            ]}
          />
          <Pagination
            {...query.data}
            disabled={disabled}
            onPageChange={(page) => setFilter({ ...filter, page })}
          />
        </>
      )}
    </section>
  )
}
