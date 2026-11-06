import { useState } from 'react'
import { Link } from 'react-router'
import { request } from '@/shared/api/httpClient'
import { employeesApi } from '@/features/employees/employeesApi'
import { getCampaign } from '@/features/campaigns/campaignsApi'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { ErrorState } from '@/shared/components/ErrorState'
import { SuccessMessage } from '@/shared/components/SuccessMessage'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { assignmentDemo } from '@/features/sponsorAssignments/api'
export function EvaluatorLink({
  campaignId,
  candidateId,
  evaluatorId,
  onChanged,
}: {
  campaignId: string
  candidateId: string
  evaluatorId: string | null
  onChanged: () => void
}) {
  const employee = useQuery(
    evaluatorId ?? '',
    (signal) => employeesApi.get(evaluatorId!, signal),
    !!evaluatorId && !assignmentDemo,
  )
  const campaign = useQuery(
    campaignId,
    (signal) => getCampaign(campaignId, signal),
    !evaluatorId && !assignmentDemo,
  )
  const operation = useOperation()
  const [confirm, setConfirm] = useState(false)
  const [message, setMessage] = useState('')
  if (assignmentDemo) return <p>La vinculación de evaluadores requiere conexión real.</p>
  return (
    <section className="detail-card space-y-3">
      <h3 className="font-semibold">Evaluador histórico · Jefe inmediato</h3>
      {evaluatorId ? (
        <>
          {employee.data ? (
            <p>
              {employee.data.fullName} · {employee.data.payrollNumber}
            </p>
          ) : (
            <p>Evaluador vinculado · consultando datos</p>
          )}
          {employee.error && <ErrorState message={employee.error} onRetry={employee.reload} />}
        </>
      ) : (
        <>
          <StatusBadge tone="warning">Pendiente de asignar evaluador</StatusBadge>
          <p>
            Primero asigna al colaborador a su patrocinador. Después vincula explícitamente la
            asignación vigente a esta convocatoria.
          </p>
          <Link to="/admin/sponsor-assignments" className="secondary">
            Administrar asignaciones
          </Link>
          {campaign.error && <ErrorState message={campaign.error} onRetry={campaign.reload} />}
          <button
            className="primary"
            disabled={operation.busy || !campaign.data || campaign.data.isArchived}
            onClick={() => {
              operation.clearError()
              setConfirm(true)
            }}
          >
            Vincular evaluador pendiente
          </button>
          {campaign.data?.isArchived && <p>La convocatoria archivada no admite vinculaciones.</p>}
        </>
      )}
      {message && <SuccessMessage>{message}</SuccessMessage>}
      <ConfirmDialog
        open={confirm}
        title="Vincular evaluador histórico"
        description="Se vinculará el patrocinador de la asignación vigente del colaborador. Un vínculo existente no se sustituirá."
        busy={operation.busy}
        error={operation.error}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          void operation.run(async (signal) => {
            const { data } = await request<{
              campaignId: string
              candidateEmployeeId: string
              sponsorEmployeeId: string | null
              isPending: boolean
            }>(`/api/admin/preselections/${campaignId}/${candidateId}/evaluator-link`, {
              method: 'POST',
              authenticated: true,
              signal,
            })
            if (!signal.aborted) {
              setConfirm(false)
              if (data.isPending)
                setMessage('No se creó un vínculo: todavía falta una asignación vigente.')
              else onChanged()
            }
          })
        }}
      />
    </section>
  )
}
