import { useState } from 'react'
import { employeesApi } from '../employeesApi'
import type { Employee } from '../types'
import { ApiError } from '@/shared/api/httpClient'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { Modal } from '@/shared/components/Modal'
import { TextField } from '@/shared/components/TextField'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
function EmployeeForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Employee
  onClose: () => void
  onSaved: () => void
}) {
  const [current, setCurrent] = useState(initial)
  const [payroll, setPayroll] = useState(initial?.payrollNumber ?? '')
  const [name, setName] = useState(initial?.fullName ?? '')
  const [conflict, setConflict] = useState(false)
  const operation = useOperation()
  async function save(signal: AbortSignal) {
    try {
      if (current) await employeesApi.rename(current.id, name.trim(), current.version, signal)
      else await employeesApi.create(payroll.trim(), name.trim(), signal)
      if (!signal.aborted) {
        onSaved()
        onClose()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && current) setConflict(true)
      throw error
    }
  }
  return (
    <Modal
      open
      title={current ? 'Detalle y corrección de empleado' : 'Alta de empleado'}
      onClose={onClose}
      busy={operation.busy}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void operation.run(save)
        }}
      >
        <TextField
          label="Nómina"
          value={payroll}
          onChange={(event) => setPayroll(event.target.value)}
          required
          maxLength={32}
          readOnly={!!current}
          disabled={operation.busy}
        />
        <TextField
          label="Nombre completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={200}
          disabled={operation.busy}
        />
        {current && <p className="text-sm">Nombre registrado: {current.fullName}</p>}
        {operation.error && (
          <p role="alert" className="text-red-700">
            {operation.error}
          </p>
        )}
        {conflict && (
          <button
            type="button"
            disabled={operation.busy}
            onClick={() =>
              void operation.run(async (signal) => {
                if (current) {
                  const latest = await employeesApi.get(current.id, signal)
                  if (!signal.aborted) {
                    setCurrent(latest)
                    setConflict(false)
                  }
                }
              })
            }
          >
            Consultar versión actual conservando mi nombre escrito
          </button>
        )}
        <button
          className="primary"
          disabled={operation.busy || conflict || !name.trim() || !payroll.trim()}
        >
          {current ? 'Guardar nombre' : 'Crear empleado'}
        </button>
      </form>
    </Modal>
  )
}
export function EmployeeEditor({
  id,
  onClose,
  onSaved,
}: {
  id?: string
  onClose: () => void
  onSaved: () => void
}) {
  const query = useQuery(id ?? 'new', (signal) => employeesApi.get(id!, signal), !!id)
  if (!id || query.data)
    return <EmployeeForm initial={query.data} onClose={onClose} onSaved={onSaved} />
  return (
    <Modal open title="Consultar empleado" onClose={onClose}>
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
    </Modal>
  )
}
