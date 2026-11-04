import { reviewApi } from '../reviewApi'
import type { ReviewCandidate } from '../types'
import { qualityLabels } from '@/features/nominations'
import { useQuery } from '@/shared/hooks/useQuery'
import { Modal } from '@/shared/components/Modal'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { formatDate, formatMonth } from '@/shared/utils/formatDate'
export function ReviewDetail({
  candidate,
  onClose,
}: {
  candidate: ReviewCandidate
  onClose: () => void
}) {
  const query = useQuery(candidate.campaignId + candidate.candidateEmployeeId, (signal) =>
    reviewApi.get(candidate.campaignId, candidate.candidateEmployeeId, signal),
  )
  const detail = query.data
  return (
    <Modal open title="Revisión integral" onClose={onClose}>
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {detail && (
        <div className="space-y-4">
          <h3 className="font-semibold">
            {detail.candidateFullName} · {detail.candidatePayrollNumber}
          </h3>
          <p>
            {formatMonth(detail.evaluationMonth)} · {detail.validNominationsCount} postulaciones
            válidas
          </p>
          <StatusBadge>{detail.isPreselected ? 'Preseleccionado' : 'Sin preselección'}</StatusBadge>
          <h3 className="font-semibold">Postulaciones</h3>
          {detail.nominations.map((item) => (
            <article key={item.id} className="detail-card">
              <p>
                {item.sponsorFullName} · {item.sponsorPayrollNumber}
              </p>
              <p>{formatDate(item.registeredAtUtc)}</p>
              <p>{qualityLabels(item.qualities)}</p>
              <p className="whitespace-pre-wrap">{item.justification}</p>
            </article>
          ))}
          <h3 className="font-semibold">Opiniones departamentales</h3>
          {detail.opinions
            .filter((item) => item.opinionSource !== 4)
            .map((item) => (
              <article key={item.opinionSource} className="detail-card">
                <h4>
                  {
                    { 1: 'Recursos Humanos', 2: 'Seguridad', 3: 'Calidad', 4: 'Jefe inmediato' }[
                      item.opinionSource
                    ]
                  }
                </h4>
                <StatusBadge tone={item.hasOpinion ? 'success' : 'warning'}>
                  {item.hasOpinion ? 'Registrada' : 'Pendiente'}
                </StatusBadge>
                {item.hasOpinion && (
                  <>
                    <p className="whitespace-pre-wrap">{item.content}</p>
                    <p>{formatDate(item.lastModifiedAtUtc)}</p>
                  </>
                )}
              </article>
            ))}
        </div>
      )}
    </Modal>
  )
}
