import { employeesApi } from '@/features/employees/employeesApi'
import { useState } from 'react'
import { usersApi } from '../usersApi'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { Modal } from '@/shared/components/Modal'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
export function AccountDetail({
  id,
  onClose,
  onSaved,
}: {
  id: string
  onClose: () => void
  onSaved: () => void
}) {
  const query = useQuery(id, (signal) => usersApi.get(id, signal)),
    operation = useOperation()
  const [confirm, setConfirm] = useState(false),
    [message, setMessage] = useState('')
  const account = query.data
  const employee = useQuery(
    account?.employeeId ?? '',
    (signal) => employeesApi.get(account!.employeeId!, signal),
    !!account?.employeeId,
  )
  return (
    <>
      <Modal open title="Detalle de cuenta" onClose={onClose} busy={operation.busy}>
        {query.loading && <LoadingState />}
        {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
        {message && <p role="status">{message}</p>}
        {account && (
          <div className="space-y-3">
            <p>Usuario: {account.userName}</p>
            <p>Roles: {account.roles.join(', ')}</p>
            <p>{account.isActive ? 'Activa' : 'Inactiva'}</p>
            {!account.employeeId ? (
              <p>
                Cuenta sin empleado vinculado. Las cuentas departamentales no requieren vinculación.
              </p>
            ) : (
              <>
                {employee.loading && <LoadingState message="Consultando empleado vinculado…" />}
                {employee.error && (
                  <ErrorState message={employee.error} onRetry={employee.reload} />
                )}
                {employee.data && (
                  <>
                    <p>Empleado: {employee.data.fullName}</p>
                    <p>Nómina: {employee.data.payrollNumber}</p>
                  </>
                )}
              </>
            )}
            <p>
              {account.mustChangePassword ? 'Debe cambiar su contraseña' : 'Contraseña actualizada'}
            </p>
            {account.roles.length === 1 && account.roles[0] === 'Sponsor' && (
              <button className="primary" onClick={() => setConfirm(true)}>
                {account.isActive ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={confirm}
        destructive={account?.isActive}
        confirmLabel={account?.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
        title="Cambiar estado del patrocinador"
        description={
          account?.isActive
            ? 'Se desactivará el acceso de esta cuenta.'
            : 'Se activará esta cuenta.'
        }
        busy={operation.busy}
        error={operation.error}
        onCancel={() => setConfirm(false)}
        onConfirm={() =>
          void operation.run(async (signal) => {
            if (account) {
              await usersApi.status(id, !account.isActive, signal)
              if (!signal.aborted) {
                setConfirm(false)
                setMessage('Estado actualizado.')
                query.reload()
                onSaved()
              }
            }
          })
        }
      />
    </>
  )
}
