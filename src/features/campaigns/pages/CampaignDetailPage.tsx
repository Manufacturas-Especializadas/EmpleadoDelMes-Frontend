import { PeriodSettings } from './PeriodSettings'
import { validSchedule, localDateInput } from '../schedulePresentation'
import { Icon } from '@/shared/components/Icon'
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
import { formatMonth } from '@/shared/utils/formatDate'
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
    if (!campaign || signal.aborted) return
    if (target.endsWith('/schedule') && !validSchedule(opening, closing))
      throw new Error('El cierre debe ser posterior a la apertura.')
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
        setSchedule(null)
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
        description="Administra los periodos y consulta el proceso de reconocimiento."
        actions={
          <Link className="secondary" to="/admin/campaigns">
            Volver al listado
          </Link>
        }
      />
      {message && <p role="status">{message}</p>}
      {operation.error && !action && !schedule && (
        <p role="alert" className="text-red-700">
          {operation.error}
        </p>
      )}
      {query.loading && <LoadingState variant="cards" />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {campaign && (
        <>
          <StatusBadge tone={campaign.isArchived ? 'warning' : 'success'}>
            {campaign.isArchived ? 'Archivada' : 'Vigente'}
          </StatusBadge>
          <div className="grid gap-4 lg:grid-cols-2">
            {(['nominations', 'opinions'] as const).map((period) => {
              const data =
                period === 'nominations' ? campaign.nominationPeriod : campaign.opinionPeriod
              return (
                <PeriodSettings
                  key={period}
                  period={period}
                  data={data}
                  open={
                    period === 'nominations'
                      ? campaign.canAcceptNominations
                      : campaign.canAcceptOpinions
                  }
                  archived={campaign.isArchived}
                  busy={operation.busy}
                  onAction={(next) => {
                    operation.clearError()
                    setAction(next)
                  }}
                  onSchedule={() => {
                    operation.clearError()
                    setOpening(localDateInput(data.scheduledOpeningAtUtc))
                    setClosing(localDateInput(data.scheduledClosingAtUtc))
                    setSchedule(period)
                  }}
                />
              )
            })}
          </div>
          <section className="surface-panel p-5 sm:p-6">
            <h2 className="mb-3 font-semibold">Continuar con el reconocimiento</h2>
            <nav aria-label="Accesos de la convocatoria" className="divide-y divide-border">
              {(
                [
                  { path: 'nominations', label: 'Administrar postulaciones', icon: 'clipboard' },
                  { path: 'preselections', label: 'Preselección', icon: 'checkUser' },
                  { path: 'review', label: 'Revisión integral', icon: 'review' },
                ] as const
              ).map((item) => (
                <Link
                  key={item.path}
                  className="flex min-h-16 items-center gap-3 rounded-control py-3 text-sm font-semibold text-primary hover:bg-info-soft"
                  to={`/admin/${item.path}?campaignId=${id}`}
                >
                  <Icon name={item.icon} />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  <Icon name="right" />
                </Link>
              ))}
            </nav>
          </section>
          <section className="surface-panel p-5 sm:p-6">
            <h2 className="font-semibold">Administración de la convocatoria</h2>
            <p className="my-3 text-sm leading-6 text-muted">
              {campaign.isArchived
                ? 'La convocatoria permanece disponible para consulta. Reabrirla permite administrar sus periodos.'
                : 'Archivar impide nuevas operaciones en esta convocatoria y conserva su información.'}
            </p>
            <button
              className={campaign.isArchived ? 'secondary' : 'danger'}
              disabled={operation.busy}
              onClick={() => {
                operation.clearError()
                setAction(campaign.isArchived ? 'reopen' : 'archive')
              }}
            >
              {campaign.isArchived ? 'Reabrir convocatoria' : 'Archivar convocatoria'}
            </button>
          </section>
        </>
      )}
      <ConfirmDialog
        open={action !== null}
        destructive={action === 'archive'}
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
        title={schedule === 'nominations' ? 'Programar postulaciones' : 'Programar opiniones'}
        onClose={() => setSchedule(null)}
        busy={operation.busy}
        description={`Introduce fecha y hora local de este equipo (${Intl.DateTimeFormat().resolvedOptions().timeZone}). Se enviarán al servidor como el mismo instante en UTC. Guardar fechas y activar el modo automático son acciones distintas.`}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (schedule) void operation.run((signal) => save(`${schedule}/schedule`, signal))
          }}
        >
          <TextField
            label="Fecha y hora de apertura"
            type="datetime-local"
            required
            value={opening}
            onChange={(event) => setOpening(event.target.value)}
            disabled={operation.busy}
          />
          <TextField
            label="Fecha y hora de cierre"
            type="datetime-local"
            required
            min={opening || undefined}
            value={closing}
            onChange={(event) => setClosing(event.target.value)}
            disabled={operation.busy}
          />
          <p className="text-sm text-muted">
            Si el periodo ya está en modo automático, las nuevas fechas determinarán su estado al
            guardar. En modo manual, guardar fechas no cambia la apertura o el cierre manual.
          </p>
          {opening && closing && !validSchedule(opening, closing) && (
            <p role="alert">El cierre debe ser posterior a la apertura.</p>
          )}
          {operation.error && <p role="alert">{operation.error}</p>}
          <button
            className="primary"
            disabled={operation.busy || !campaign || !validSchedule(opening, closing)}
          >
            Confirmar programación
          </button>
        </form>
      </Modal>
    </div>
  )
}
