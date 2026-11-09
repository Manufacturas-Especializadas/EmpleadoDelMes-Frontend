import { useState } from 'react'
import { usersApi } from '../usersApi'
import { CreateAccount } from '../components/CreateAccount'
import { AccountDetail } from '../components/AccountDetail'
import { useQuery } from '@/shared/hooks/useQuery'
import { PageHeader } from '@/shared/components/PageHeader'
import { SearchInput } from '@/shared/components/SearchInput'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
export function UsersPage() {
  const [filter, setFilter] = useState({ term: '', role: '', page: 1 }),
    [term, setTerm] = useState(''),
    [role, setRole] = useState('')
  const query = useQuery(JSON.stringify(filter), (signal) =>
    usersApi.list(filter.term, filter.role, filter.page, signal),
  )
  const [create, setCreate] = useState<'sponsor' | 'department' | 'organizer' | null>(null),
    [id, setId] = useState<string | null>(null)
  return (
    <div>
      <PageHeader
        title="Usuarios"
        actions={
          <div className="flex flex-wrap gap-3">
            <button className="secondary" onClick={() => setCreate('organizer')}>
              Crear organizador
            </button>
            <button className="primary" onClick={() => setCreate('sponsor')}>
              Crear patrocinador
            </button>
            <button className="secondary" onClick={() => setCreate('department')}>
              Crear cuenta departamental
            </button>
          </div>
        }
      />
      <form
        className="filter-panel"
        onSubmit={(event) => {
          event.preventDefault()
          setFilter({ term: term.trim(), role, page: 1 })
        }}
      >
        <SearchInput label="Buscar cuentas" value={term} onValueChange={setTerm} maxLength={100} />
        <label>
          Rol
          <select
            className="block rounded border p-3"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="">Todos</option>
            {['Administrator', 'Organizer', 'Sponsor', 'HumanResources', 'Safety', 'Quality'].map((item) => (
              <option key={item} value={item}>{item === 'Organizer' ? 'Organizador' : item}</option>
            ))}
          </select>
        </label>
        <button className="primary">Buscar</button>
      </form>
      {query.loading && <LoadingState variant="table" />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Cuentas"
            rows={query.data.items}
            rowKey={(row) => row.id}
            columns={[
              { id: 'user', header: 'Usuario', cell: (row) => row.userName },
              {
                id: 'employee',
                header: 'Empleado',
                cell: (row) => row.employeeFullName ?? 'Sin vínculo',
              },
              { id: 'roles', header: 'Roles', cell: (row) => row.roles.map((role) => role === 'Organizer' ? 'Organizador' : role).join(', ') },
              {
                id: 'status',
                header: 'Estado',
                cell: (row) => (
                  <StatusBadge tone={row.isActive ? 'success' : 'neutral'}>
                    {row.isActive ? 'Activa' : 'Inactiva'}
                  </StatusBadge>
                ),
              },
              {
                id: 'detail',
                header: 'Detalle',
                cell: (row) => <button onClick={() => setId(row.id)}>Consultar</button>,
              },
            ]}
          />
          <Pagination {...query.data} onPageChange={(page) => setFilter({ ...filter, page })} />
        </>
      )}
      {create && (
        <CreateAccount kind={create} onClose={() => setCreate(null)} onSaved={query.reload} />
      )}
      {id && <AccountDetail id={id} onClose={() => setId(null)} onSaved={query.reload} />}
    </div>
  )
}
