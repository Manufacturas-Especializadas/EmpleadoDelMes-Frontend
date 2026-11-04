import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getCampaign, changeCampaign, type CampaignAction } from '../campaignsApi'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { ApiError } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/components/PageHeader'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Modal } from '@/shared/components/Modal'
import { TextField } from '@/shared/components/TextField'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatMonth, formatDate } from '@/shared/utils/formatDate'
const actions: { action: CampaignAction; label: string }[] = [
  { action: 'nominations/open', label: 'Abrir postulaciones' },
  { action: 'nominations/close', label: 'Cerrar postulaciones' },
  { action: 'nominations/automatic', label: 'Postulaciones automáticas' },
  { action: 'opinions/open', label: 'Abrir opiniones' },
  { action: 'opinions/close', label: 'Cerrar opiniones' },
  { action: 'opinions/automatic', label: 'Opiniones automáticas' },
  { action: 'archive', label: 'Archivar' },
  { action: 'reopen', label: 'Reabrir' },
]
export function CampaignDetailPage() {
  const { id = '' } = useParams()
  const query = useQuery(id, (signal) => getCampaign(id, signal))
  const operation = useOperation()
  const [action, setAction] = useState<CampaignAction | null>(null)
  const [schedule, setSchedule] = useState<'nominations' | 'opinions' | null>(null)
  const [opening, setOpening] = useState('')
  const [closing, setClosing] = useState('')
  const [message, setMessage] = useState('')
  const campaign = query.data
  async function save(target: CampaignAction, signal: AbortSignal) {
    if (!campaign) return
    try {
      await changeCampaign(
        id,
        target,
        {
          version: campaign.version,
          ...(target.endsWith('/schedule')
            ? {
                openingAt: new Date(opening).toISOString(),
                closingAt: new Date(closing).toISOString(),
              }
            : {}),
        },
        signal,
      )
      if (signal.aborted) return
      setAction(null)
      setSchedule(null)
      setMessage('Convocatoria actualizada.')
      query.reload()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setAction(null)
        query.reload()
        setMessage(
          'La información cambió. Se está consultando la versión actual; revisa antes de volver a guardar.',
        )
      }
      throw error
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader
        title={campaign ? formatMonth(campaign.evaluationMonth) : 'Detalle de convocatoria'}
        description={id}
        actions={<Link to="/admin/campaigns">Volver al listado</Link>}
      />
      {message && <p role="status">{message}</p>}
      {operation.error && !action && !schedule && (
        <p role="alert" className="text-red-700">
          {operation.error}
        </p>
      )}
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {campaign && (
        <>
          <StatusBadge tone={campaign.isArchived ? 'warning' : 'success'}>
            {campaign.isArchived ? 'Archivada' : 'Vigente'}
          </StatusBadge>
          <div className="grid gap-4 md:grid-cols-2">
            {(['nominations', 'opinions'] as const).map((period) => {
              const data =
                period === 'nominations' ? campaign.nominationPeriod : campaign.opinionPeriod
              const open =
                period === 'nominations'
                  ? campaign.canAcceptNominations
                  : campaign.canAcceptOpinions
              return (
                <section key={period} className="rounded-xl border border-slate-200 bg-white p-4">
                  <h2 className="font-semibold">
                    {period === 'nominations' ? 'Postulaciones' : 'Opiniones'}
                  </h2>
                  <StatusBadge tone={open ? 'success' : 'neutral'}>
                    {open ? 'Abierto' : 'Cerrado'}
                  </StatusBadge>
                  <p>{['Automático', 'Apertura manual', 'Cierre manual'][data.mode]}</p>
                  <p>Apertura: {formatDate(data.scheduledOpeningAtUtc)}</p>
                  <p>Cierre: {formatDate(data.scheduledClosingAtUtc)}</p>
                  <button
                    className="primary mt-3"
                    disabled={operation.busy}
                    onClick={() => {
                      operation.clearError()
                      setOpening('')
                      setClosing('')
                      setSchedule(period)
                    }}
                  >
                    Programar periodo
                  </button>
                </section>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            {actions.map((item) => (
              <button
                key={item.action}
                className="border border-slate-300 px-4 py-2"
                disabled={operation.busy}
                onClick={() => {
                  operation.clearError()
                  setAction(item.action)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <nav className="flex flex-wrap gap-4">
            <Link to={`/admin/preselections?campaignId=${id}`}>Preselección</Link>
            <Link to={`/admin/review?campaignId=${id}`}>Revisión integral</Link>
          </nav>
        </>
      )}
      <ConfirmDialog
        open={action !== null}
        title={actions.find((item) => item.action === action)?.label ?? 'Confirmar'}
        description="Este cambio modifica la disponibilidad de la convocatoria. ¿Deseas continuar?"
        busy={operation.busy}
        error={operation.error}
        onCancel={() => setAction(null)}
        onConfirm={() => {
          if (action) void operation.run((signal) => save(action, signal))
        }}
      />
      <Modal
        open={schedule !== null}
        title="Programar periodo"
        onClose={() => setSchedule(null)}
        busy={operation.busy}
        description="Introduce las fechas en la zona horaria de este equipo. Se enviarán como ISO 8601 en UTC (Z)."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (schedule) void operation.run((signal) => save(`${schedule}/schedule`, signal))
          }}
        >
          <TextField
            label="Apertura"
            type="datetime-local"
            required
            value={opening}
            onChange={(event) => setOpening(event.target.value)}
            disabled={operation.busy}
          />
          <TextField
            label="Cierre"
            type="datetime-local"
            required
            min={opening || undefined}
            value={closing}
            onChange={(event) => setClosing(event.target.value)}
            disabled={operation.busy}
          />
          {operation.error && <p role="alert">{operation.error}</p>}
          <button className="primary" disabled={operation.busy || !campaign || closing <= opening}>
            Confirmar programación
          </button>
        </form>
      </Modal>
    </div>
  )
}
