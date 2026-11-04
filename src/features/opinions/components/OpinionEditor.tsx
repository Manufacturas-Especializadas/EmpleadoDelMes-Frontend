import { useState } from 'react'
import type { OpinionCandidate, OpinionStatus } from '../types'
import { opinionsApi } from '../opinionsApi'
import { ApiError } from '@/shared/api/httpClient'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { Modal } from '@/shared/components/Modal'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatDate } from '@/shared/utils/formatDate'
function OpinionForm({
  candidate,
  initial,
  onSaved,
  onClose,
}: {
  candidate: OpinionCandidate
  initial: OpinionStatus
  onSaved: () => void
  onClose: () => void
}) {
  const [status, setStatus] = useState(initial)
  const [content, setContent] = useState(initial.opinion?.content ?? '')
  const [blocked, setBlocked] = useState(false)
  const operation = useOperation()
  async function save(signal: AbortSignal) {
    try {
      const opinion = await opinionsApi.save(
        candidate.campaignId,
        candidate.candidateEmployeeId,
        content,
        status.opinion?.version ?? null,
        signal,
      )
      if (!signal.aborted) {
        setStatus({ hasOpinion: true, opinion, message: null })
        onSaved()
        onClose()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setBlocked(true)
        const current = await opinionsApi.get(
          candidate.campaignId,
          candidate.candidateEmployeeId,
          signal,
        )
        if (!signal.aborted) {
          setStatus(current)
          onSaved()
        }
      }
      throw error
    }
  }
  return (
    <Modal open title={candidate.candidateFullName} onClose={onClose} busy={operation.busy}>
      <p>{status.hasOpinion ? 'Opinión registrada' : 'Opinión pendiente'}</p>
      {status.opinion && (
        <details className="my-3">
          <summary>
            Consultar versión registrada · {formatDate(status.opinion.lastModifiedAtUtc)}
          </summary>
          <p className="whitespace-pre-wrap">{status.opinion.content}</p>
        </details>
      )}
      <p className="my-3 text-sm text-slate-600">
        El servidor permite guardar únicamente durante el periodo abierto y mientras el candidato
        siga preseleccionado.
      </p>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void operation.run(save)
        }}
      >
        <label htmlFor="opinion-content">Opinión de tu departamento ({content.length}/500)</label>
        <textarea
          id="opinion-content"
          className="w-full rounded-lg border p-3"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={500}
          required
          disabled={operation.busy}
        />
        {operation.error && (
          <p role="alert" className="text-red-700">
            {operation.error}
          </p>
        )}
        {blocked && (
          <div role="status">
            <p>
              Se conservó tu texto. Revisa la versión registrada y confirma con administración que
              el periodo esté abierto.
            </p>
            <button type="button" className="my-3 underline" onClick={() => setBlocked(false)}>
              Ya revisé los datos; habilitar un nuevo intento manual
            </button>
          </div>
        )}
        <button className="primary" disabled={operation.busy || blocked || !content.trim()}>
          {status.hasOpinion ? 'Guardar cambios' : 'Guardar opinión'}
        </button>
      </form>
    </Modal>
  )
}
export function OpinionEditor({
  candidate,
  onSaved,
  onClose,
}: {
  candidate: OpinionCandidate
  onSaved: () => void
  onClose: () => void
}) {
  const query = useQuery(candidate.campaignId + candidate.candidateEmployeeId, (signal) =>
    opinionsApi.get(candidate.campaignId, candidate.candidateEmployeeId, signal),
  )
  if (query.data)
    return (
      <OpinionForm candidate={candidate} initial={query.data} onSaved={onSaved} onClose={onClose} />
    )
  return (
    <Modal open title="Consultar opinión" onClose={onClose}>
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
    </Modal>
  )
}
