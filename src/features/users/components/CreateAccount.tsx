import { useState } from 'react'
import { EmployeeSearch, type Employee } from '@/features/employees'
import { usersApi } from '../usersApi'
import type { CreatedAccount, DepartmentRole } from '../types'
import { useOperation } from '@/shared/hooks/useOperation'
import { Modal } from '@/shared/components/Modal'
export function CreateAccount({
  kind,
  onClose,
  onSaved,
}: {
  kind: 'sponsor' | 'department'
  onClose: () => void
  onSaved: () => void
}) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [role, setRole] = useState<DepartmentRole>('HumanResources')
  const [created, setCreated] = useState<CreatedAccount | null>(null)
  const [copyMessage, setCopyMessage] = useState('')
  const operation = useOperation()
  async function create(signal: AbortSignal) {
    const result =
      kind === 'sponsor'
        ? await usersApi.sponsor(employee!.id, signal)
        : await usersApi.department(role, signal)
    if (!signal.aborted) {
      setCreated(result)
      onSaved()
    }
  }
  return (
    <Modal
      open
      title={
        created
          ? 'Cuenta creada'
          : kind === 'sponsor'
            ? 'Crear patrocinador'
            : 'Crear cuenta departamental'
      }
      onClose={() => {
        setCreated(null)
        onClose()
      }}
      busy={operation.busy}
    >
      {created ? (
        <div className="space-y-4">
          <p role="status">{created.message}</p>
          <p>Usuario: {created.account.userName}</p>
          <p>
            Contraseña temporal:{' '}
            <code className="break-all select-all">{created.temporaryPassword}</code>
          </p>
          <p className="text-amber-800">
            Entrégala de forma privada. Al cerrar esta ventana no podrás volver a consultarla aquí.
            Si la copias, limpia el portapapeles después de entregarla.
          </p>
          <button
            className="primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(created.temporaryPassword)
                setCopyMessage('Copiada.')
              } catch {
                setCopyMessage('No se pudo copiar. Selecciona el texto y cópialo manualmente.')
              }
            }}
          >
            Copiar contraseña
          </button>
          <p role="status">{copyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {kind === 'sponsor' ? (
            <>
              <EmployeeSearch
                disabled={operation.busy}
                onSelect={(item) => {
                  setEmployee(item)
                  operation.clearError()
                }}
              />
              {employee && (
                <p>
                  Seleccionado: {employee.fullName} · {employee.payrollNumber}
                </p>
              )}
            </>
          ) : (
            <label>
              Departamento
              <select
                className="block w-full rounded border p-3"
                disabled={operation.busy}
                value={role}
                onChange={(event) => setRole(event.target.value as DepartmentRole)}
              >
                <option value="HumanResources">Recursos Humanos</option>
                <option value="Safety">Seguridad</option>
                <option value="Quality">Calidad</option>
              </select>
            </label>
          )}
          <p>El nombre de usuario lo determina el servidor.</p>
          {operation.error && <p role="alert">{operation.error}</p>}
          <button
            className="primary"
            disabled={operation.busy || (kind === 'sponsor' && !employee)}
            onClick={() => void operation.run(create)}
          >
            Crear cuenta
          </button>
        </div>
      )}
    </Modal>
  )
}
