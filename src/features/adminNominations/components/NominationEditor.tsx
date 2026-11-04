import { useState } from 'react'
import { adminNominationsApi } from '../adminNominationsApi'
import type { AdminNominationDetail } from '../types'
import { getCampaign } from '@/features/campaigns'
import { qualities, qualityLabels } from '@/features/nominations'
import { ApiError } from '@/shared/api/httpClient'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { Modal } from '@/shared/components/Modal'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatDate } from '@/shared/utils/formatDate'
function Editor({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminNominationDetail
  onClose: () => void
  onSaved: () => void
}) {
  const [current, setCurrent] = useState(initial),
    [flags, setFlags] = useState(initial.nomination.qualities),
    [justification, setJustification] = useState(initial.justification),
    [reason, setReason] = useState(''),
    [action, setAction] = useState<'correct' | 'cancel' | null>(null),
    [conflict, setConflict] = useState(false),
    [message, setMessage] = useState('')
  const campaign = useQuery(current.nomination.campaignId, (signal) =>
      getCampaign(current.nomination.campaignId, signal),
    ),
    operation = useOperation()
  const blocked =
    current.nomination.isCancelled || !campaign.data || campaign.data.isArchived || conflict
  async function save(signal: AbortSignal) {
    if (blocked) return
    try {
      if (action === 'correct') {
        const result = await adminNominationsApi.correct(
          current.nomination.id,
          { version: current.version, qualities: flags, justification, reason },
          signal,
        )
        if (!signal.aborted) {
          setCurrent(result.detail)
          setMessage(result.message)
        }
      } else {
        const result = await adminNominationsApi.cancel(
          current.nomination.id,
          current.version,
          reason,
          signal,
        )
        if (!signal.aborted) {
          setCurrent(result)
          setMessage('Postulación anulada.')
        }
      }
      if (!signal.aborted) {
        setAction(null)
        setReason('')
        onSaved()
      }
    } catch (error) {
      setAction(null)
      if (error instanceof ApiError && error.status === 409) setConflict(true)
      throw error
    }
  }
  return (
    <>
      <Modal open title="Detalle de postulación" onClose={onClose} busy={operation.busy}>
        <div className="space-y-3">
          <p>
            Patrocinador: {current.nomination.sponsorFullName} ·{' '}
            {current.nomination.sponsorPayrollNumber}
          </p>
          <p>
            Candidato: {current.nomination.candidateFullName} ·{' '}
            {current.nomination.candidatePayrollNumber}
          </p>
          <p>
            {formatDate(current.nomination.registeredAtUtc)} ·{' '}
            {current.nomination.isCancelled ? 'Anulada' : 'Vigente'}
          </p>
          <details>
            <summary>Datos registrados</summary>
            <p>{qualityLabels(current.nomination.qualities)}</p>
            <p className="whitespace-pre-wrap">{current.justification}</p>
          </details>
          {campaign.loading && <LoadingState />}
          {campaign.error && <ErrorState message={campaign.error} onRetry={campaign.reload} />}
          {campaign.data?.isArchived && <p>Convocatoria archivada: solo consulta.</p>}
          {message && <p role="status">{message}</p>}
          {operation.error && <p role="alert">{operation.error}</p>}
          {conflict && (
            <button
              disabled={operation.busy}
              onClick={() =>
                void operation.run(async (signal) => {
                  const latest = await adminNominationsApi.get(current.nomination.id, signal)
                  if (!signal.aborted) {
                    setCurrent(latest)
                    setConflict(false)
                    campaign.reload()
                    setMessage(
                      'Versión actual consultada. Tu formulario se conservó; revisa antes de confirmar.',
                    )
                  }
                })
              }
            >
              Consultar versión actual sin borrar el formulario
            </button>
          )}
          {!current.nomination.isCancelled && (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                setAction('correct')
              }}
            >
              <fieldset disabled={blocked || operation.busy}>
                <legend>Cualidades</legend>
                {qualities.map((item) => (
                  <label key={item.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-auto"
                      checked={(flags & item.value) !== 0}
                      onChange={() => setFlags(flags ^ item.value)}
                    />
                    {item.label}
                  </label>
                ))}
                <label htmlFor="admin-justification">
                  Justificación ({justification.length}/500)
                </label>
                <textarea
                  id="admin-justification"
                  className="w-full rounded border p-3"
                  maxLength={500}
                  required
                  value={justification}
                  onChange={(event) => setJustification(event.target.value)}
                />
                <label htmlFor="admin-reason">
                  Motivo de corrección o anulación ({reason.length}/1000)
                </label>
                <textarea
                  id="admin-reason"
                  className="w-full rounded border p-3"
                  maxLength={1000}
                  required
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    className="primary"
                    disabled={!flags || !justification.trim() || !reason.trim()}
                  >
                    Corregir
                  </button>
                  <button
                    type="button"
                    className="border px-3"
                    disabled={!reason.trim()}
                    onClick={() => setAction('cancel')}
                  >
                    Anular
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={action !== null}
        destructive={action === 'cancel'}
        confirmLabel={action === 'cancel' ? 'Anular postulación' : 'Guardar corrección'}
        title={action === 'cancel' ? 'Anular postulación' : 'Corregir postulación'}
        description={`Confirma esta operación. Motivo: ${reason}`}
        busy={operation.busy}
        error={operation.error}
        onCancel={() => setAction(null)}
        onConfirm={() => void operation.run(save)}
      />
    </>
  )
}
export function NominationEditor({
  id,
  onClose,
  onSaved,
}: {
  id: string
  onClose: () => void
  onSaved: () => void
}) {
  const query = useQuery(id, (signal) => adminNominationsApi.get(id, signal))
  return query.data ? (
    <Editor initial={query.data} onClose={onClose} onSaved={onSaved} />
  ) : (
    <Modal open title="Consultar postulación" onClose={onClose}>
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
    </Modal>
  )
}
