import type { CampaignPeriod } from '../types'
import type { CampaignAction } from '../campaignsApi'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { ToggleSwitch } from '@/shared/components/ToggleSwitch'
import { Icon } from '@/shared/components/Icon'
import { formatDate } from '@/shared/utils/formatDate'
export function PeriodSettings({
  period,
  data,
  open,
  archived,
  busy,
  onAction,
  onSchedule,
}: {
  period: 'nominations' | 'opinions'
  data: CampaignPeriod
  open: boolean
  archived: boolean
  busy: boolean
  onAction: (action: CampaignAction) => void
  onSchedule: () => void
}) {
  const title = period === 'nominations' ? 'Postulaciones' : 'Opiniones departamentales'
  return (
    <section className="surface-panel min-w-0 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <StatusBadge tone={open ? 'success' : 'neutral'}>
          {open ? 'Abierto' : 'Cerrado'}
        </StatusBadge>
      </div>
      <p className="mt-2 text-sm text-muted">
        {['Automático · Según calendario', 'Apertura manual', 'Cierre manual'][data.mode]}
      </p>
      <div className="my-4 border-y border-border py-3">
        {data.mode === 0 ? (
          <>
            <p className="mb-3 text-sm leading-6 text-muted">
              El calendario determina la apertura y el cierre. Para controlar el periodo
              directamente, elige un estado manual.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                className="secondary"
                disabled={busy || archived}
                onClick={() => onAction(`${period}/open`)}
              >
                Abrir manualmente
              </button>
              <button
                className="secondary"
                disabled={busy || archived}
                onClick={() => onAction(`${period}/close`)}
              >
                Cerrar manualmente
              </button>
            </div>
          </>
        ) : (
          <>
            <ToggleSwitch
              label="Apertura manual"
              checked={data.mode === 1}
              disabled={archived}
              loading={busy}
              onChange={(next) => onAction(`${period}/${next ? 'open' : 'close'}`)}
            />
            <button
              className="quiet mt-2"
              disabled={
                busy || archived || !data.scheduledOpeningAtUtc || !data.scheduledClosingAtUtc
              }
              onClick={() => onAction(`${period}/automatic`)}
            >
              Usar calendario automático
            </button>
            {!data.scheduledOpeningAtUtc && (
              <p className="text-xs text-muted">
                Configura las fechas para habilitar el modo automático.
              </p>
            )}
          </>
        )}
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-muted">Apertura programada</dt>
          <dd className="mt-1 font-medium">{formatDate(data.scheduledOpeningAtUtc)}</dd>
        </div>
        <div>
          <dt className="text-muted">Cierre programado</dt>
          <dd className="mt-1 font-medium">{formatDate(data.scheduledClosingAtUtc)}</dd>
        </div>
      </dl>
      <button
        className="secondary mt-5 w-full sm:w-auto"
        disabled={busy || archived}
        onClick={onSchedule}
      >
        <Icon name="calendar" />
        Configurar fechas
      </button>
      {archived && (
        <p className="mt-3 text-sm text-muted">
          Convocatoria archivada. Reábrela para modificar este periodo.
        </p>
      )}
    </section>
  )
}
