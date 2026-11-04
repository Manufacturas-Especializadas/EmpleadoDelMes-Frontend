import { useState } from 'react'
import { employeesApi } from '../employeesApi'
import type { Employee } from '../types'
import { useQuery } from '@/shared/hooks/useQuery'
import { ListFilters } from '@/shared/components/ListFilters'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
export function EmployeeSearch({
  onSelect,
  actionLabel = 'Seleccionar',
  revision = 0,
  disabled = false,
}: {
  onSelect: (employee: Employee) => void
  actionLabel?: string
  revision?: number
  disabled?: boolean
}) {
  const [filter, setFilter] = useState({ term: '', page: 1 })
  const query = useQuery(JSON.stringify(filter) + revision, (signal) =>
    employeesApi.list(filter.term, filter.page, signal),
  )
  return (
    <fieldset disabled={disabled}>
      <ListFilters onSearch={(term) => setFilter({ term, page: 1 })} />
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Empleados"
            rows={query.data.items}
            rowKey={(row) => row.id}
            columns={[
              { id: 'payroll', header: 'Nómina', cell: (row) => row.payrollNumber },
              { id: 'name', header: 'Nombre completo', cell: (row) => row.fullName },
              {
                id: 'action',
                header: 'Acción',
                cell: (row) => (
                  <button type="button" onClick={() => onSelect(row)}>
                    {actionLabel}
                  </button>
                ),
              },
            ]}
          />
          <Pagination {...query.data} onPageChange={(page) => setFilter({ ...filter, page })} />
        </>
      )}
    </fieldset>
  )
}
