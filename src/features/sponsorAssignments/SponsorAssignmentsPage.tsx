import { useState } from 'react'
import { employeesApi } from '@/features/employees/employeesApi'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { PageHeader } from '@/shared/components/PageHeader'
import { Modal } from '@/shared/components/Modal'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { SuccessMessage } from '@/shared/components/SuccessMessage'
import { ListFilters } from '@/shared/components/ListFilters'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { EmployeeList } from './EmployeeList'
import { assignmentDemo, assignmentsApi, type AssignmentEmployee } from './api'
export function SponsorAssignmentsPage() {
  const [sponsor, setSponsor] = useState<AssignmentEmployee | null>(null)
  const [employee, setEmployee] = useState<AssignmentEmployee | null>(null)
  const [revision, setRevision] = useState(0)
  const [mode, setMode] = useState('available')
  const [message, setMessage] = useState('')
  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignación de colaboradores"
        description="Administra relaciones vigentes. Reasignar no sustituye evaluadores históricos de convocatorias."
      />
      {assignmentDemo ? (
        <EmptyState
          title="Requiere conexión con el backend"
          description="No hay datos simulados de asignaciones."
        />
      ) : (
        <>
          {message && <SuccessMessage>{message}</SuccessMessage>}
          <EmployeeList path="sponsors" title="Patrocinadores disponibles" onSelect={setSponsor} />
          {sponsor && (
            <section className="surface-panel space-y-4 p-5">
              <h2 className="font-semibold">
                Patrocinador seleccionado: {sponsor.fullName} · {sponsor.payrollNumber}
              </h2>
              <EmployeeList
                key={`${sponsor.id}-${revision}`}
                path={`sponsors/${sponsor.id}/employees`}
                title="Colaboradores asignados"
                action="Administrar"
                onSelect={setEmployee}
              />
            </section>
          )}
          <label>
            Buscar colaboradores
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="available">Disponibles para asignar</option>
              <option value="pending">Pendientes de asignación</option>
              <option value="all">Todos los empleados · reasignar o retirar</option>
            </select>
          </label>
          {mode === 'all' ? (
            <AllEmployees key={`all-${revision}`} onSelect={setEmployee} />
          ) : (
            <EmployeeList
              key={`${mode}-${sponsor?.id}-${revision}`}
              path={
                mode === 'pending'
                  ? 'employees/pending'
                  : `employees/available${sponsor ? `?sponsorId=${sponsor.id}` : ''}`
              }
              title={mode === 'pending' ? 'Empleados pendientes' : 'Empleados disponibles'}
              action="Administrar asignación"
              onSelect={setEmployee}
            />
          )}
          {employee && (
            <AssignmentEditor
              employee={employee}
              preferred={sponsor}
              onClose={() => setEmployee(null)}
              onSaved={() => {
                setEmployee(null)
                setRevision((value) => value + 1)
                setMessage('Asignación actualizada. Puedes continuar con otro colaborador.')
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
function AllEmployees({ onSelect }: { onSelect: (employee: AssignmentEmployee) => void }) {
  const [filter, setFilter] = useState({ term: '', page: 1 })
  const query = useQuery(JSON.stringify(filter), (signal) =>
    employeesApi.list(filter.term, filter.page, signal),
  )
  return (
    <section>
      <ListFilters onSearch={(term) => setFilter({ term, page: 1 })} />
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Todos los empleados"
            rows={query.data.items}
            rowKey={(row) => row.id}
            columns={[
              {
                id: 'name',
                header: 'Empleado',
                cell: (row) => `${row.fullName} · ${row.payrollNumber}`,
              },
              {
                id: 'action',
                header: 'Acción',
                cell: (row) => (
                  <button className="secondary" onClick={() => onSelect(row)}>
                    Administrar asignación
                  </button>
                ),
              },
            ]}
          />
          <Pagination {...query.data} onPageChange={(page) => setFilter({ ...filter, page })} />
        </>
      )}
    </section>
  )
}
function AssignmentEditor({
  employee,
  preferred,
  onClose,
  onSaved,
}: {
  employee: AssignmentEmployee
  preferred: AssignmentEmployee | null
  onClose: () => void
  onSaved: () => void
}) {
  const query = useQuery(employee.id, (signal) => assignmentsApi.current(employee.id, signal))
  const current = query.data?.assignment
  const name = useQuery(
    current?.sponsorEmployeeId ?? '',
    (signal) => employeesApi.get(current!.sponsorEmployeeId, signal),
    !!current,
  )
  const [target, setTarget] = useState(preferred?.id === employee.id ? null : preferred)
  const [confirm, setConfirm] = useState<'assign' | 'reassign' | 'withdraw' | null>(null)
  const operation = useOperation()
  const [stale, setStale] = useState(false)
  return (
    <>
      <Modal
        open
        title={`${employee.fullName} · ${employee.payrollNumber}`}
        onClose={onClose}
        busy={operation.busy}
      >
        {query.loading && <LoadingState />}
        {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
        {query.data && (
          <div className="space-y-4">
            <p>
              {current
                ? `Asignación vigente: ${name.data ? `${name.data.fullName} · ${name.data.payrollNumber}` : 'Consultando patrocinador…'}`
                : 'Sin asignación vigente.'}
            </p>
            {name.error && <ErrorState message={name.error} onRetry={name.reload} />}
            <EmployeeList
              path="sponsors"
              title="Seleccionar patrocinador destino"
              exclude={[employee.id, ...(current ? [current.sponsorEmployeeId] : [])]}
              onSelect={setTarget}
              disabled={operation.busy}
            />
            {target && (
              <p>
                Destino: {target.fullName} · {target.payrollNumber}
              </p>
            )}
            {operation.error && <ErrorState message={operation.error} />}
            {stale && (
              <button
                className="secondary"
                onClick={() => {
                  query.reload()
                  setStale(false)
                  operation.clearError()
                }}
              >
                Recargar asignación antes de continuar
              </button>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                className="primary"
                disabled={
                  operation.busy ||
                  stale ||
                  !target ||
                  target.id === employee.id ||
                  target.id === current?.sponsorEmployeeId
                }
                onClick={() => setConfirm(current ? 'reassign' : 'assign')}
              >
                {current ? 'Reasignar' : 'Asignar'}
              </button>
              {current && (
                <button
                  className="danger"
                  disabled={operation.busy || stale}
                  onClick={() => setConfirm('withdraw')}
                >
                  Retirar asignación
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={!!confirm}
        title={confirm === 'withdraw' ? 'Retirar asignación' : 'Confirmar asignación'}
        description={
          confirm === 'withdraw'
            ? `Se retirará la relación vigente de ${employee.fullName}, conservando su historial.`
            : `${employee.fullName} quedará asignado a ${target?.fullName}. No cambia evaluadores históricos.`
        }
        busy={operation.busy}
        error={operation.error}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          void operation.run(async (signal) => {
            if (!confirm) return
            try {
              await assignmentsApi.change(
                employee.id,
                confirm,
                confirm === 'withdraw'
                  ? { version: current!.version }
                  : {
                      sponsorEmployeeId: target!.id,
                      ...(confirm === 'reassign' ? { version: current!.version } : {}),
                    },
                signal,
              )
              if (!signal.aborted) onSaved()
            } catch (error) {
              if (!signal.aborted) {
                setStale(true)
                setConfirm(null)
              }
              throw error
            }
          })
        }}
      />
    </>
  )
}
