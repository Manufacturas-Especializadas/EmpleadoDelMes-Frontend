import { useState } from 'react'
import { employeesApi } from '../employeesApi'
import { EmployeeSearch } from '../components/EmployeeSearch'
import { EmployeeEditor } from '../components/EmployeeEditor'
import { useOperation } from '@/shared/hooks/useOperation'
import { PageHeader } from '@/shared/components/PageHeader'
import { TextField } from '@/shared/components/TextField'
export function EmployeesPage() {
  const [editor, setEditor] = useState<string | null>(null),
    [revision, setRevision] = useState(0),
    [message, setMessage] = useState(''),
    [payroll, setPayroll] = useState('')
  const operation = useOperation()
  return (
    <div className="space-y-4">
      <PageHeader
        title="Empleados"
        actions={
          <button className="primary" onClick={() => setEditor('')}>
            Alta manual
          </button>
        }
      />
      {message && <p role="status">{message}</p>}
      <form
        className="filter-panel"
        onSubmit={(event) => {
          event.preventDefault()
          void operation.run(async (signal) => {
            const employee = await employeesApi.byPayroll(payroll.trim(), signal)
            if (!signal.aborted) setEditor(employee.id)
          })
        }}
      >
        <TextField
          label="Consulta por nómina exacta"
          required
          maxLength={32}
          value={payroll}
          onChange={(event) => setPayroll(event.target.value)}
        />
        <button className="primary" disabled={operation.busy}>
          Consultar
        </button>
      </form>
      {operation.error && <p role="alert">{operation.error}</p>}
      <EmployeeSearch
        revision={revision}
        actionLabel="Consultar / corregir"
        onSelect={(employee) => setEditor(employee.id)}
      />
      {editor !== null && (
        <EmployeeEditor
          key={editor}
          id={editor || undefined}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setRevision((value) => value + 1)
            setMessage('Empleado guardado correctamente.')
          }}
        />
      )}
    </div>
  )
}

