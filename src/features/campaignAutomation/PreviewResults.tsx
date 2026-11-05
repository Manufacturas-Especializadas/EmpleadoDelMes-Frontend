import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { formatMonth } from '@/shared/utils/formatDate'
import { plantDate } from './presentation'
import type { AutomationPreview } from './types'

export function PreviewResults({ preview }: { preview: AutomationPreview }) {
  const [page, setPage] = useState(1)
  const pageSize = 4
  if (!preview.months.length)
    return (
      <EmptyState
        title="No hay meses para mostrar"
        description="El intervalo consultado no contiene convocatorias previstas."
      />
    )
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Horario de Monterrey · {preview.pendingMonths.length} mes(es) pendiente(s) de generación
        según el servidor, incluido el mes actual si todavía no existe. La vista previa no reserva
        fechas ni guarda cambios; los conflictos pueden impedir la generación.
      </p>
      {preview.months.slice((page - 1) * pageSize, page * pageSize).map((month) => {
        const existing = month.existingCampaign
        const dates = month.alreadyExists
          ? [
              existing?.nominationPeriod.scheduledOpeningAtUtc ?? null,
              existing?.nominationPeriod.scheduledClosingAtUtc ?? null,
              existing?.opinionPeriod.scheduledOpeningAtUtc ?? null,
              existing?.opinionPeriod.scheduledClosingAtUtc ?? null,
            ]
          : [
              month.dates.nominationOpening,
              month.dates.nominationClosing,
              month.dates.opinionOpening,
              month.dates.opinionClosing,
            ]
        return (
          <article
            key={month.evaluationMonth}
            className="rounded-2xl border border-border p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold capitalize">{formatMonth(month.evaluationMonth)}</h3>
              <StatusBadge
                tone={month.alreadyExists ? 'neutral' : month.isPending ? 'warning' : 'info'}
              >
                {month.alreadyExists
                  ? month.isArchived
                    ? 'Archivada · sin cambios'
                    : 'Existente · sin cambios'
                  : month.isPending
                    ? 'Nueva · pendiente de generación'
                    : 'Futura · planificada'}
              </StatusBadge>
            </div>
            <p className="mt-3 text-sm text-muted">
              {month.alreadyExists
                ? 'Horarios guardados. Los modos manuales y las excepciones existentes se conservan.'
                : 'Horarios propuestos por el calendario que estás revisando.'}
            </p>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-muted">
                  {month.alreadyExists
                    ? 'Fecha de creación registrada'
                    : 'Disponibilidad para creación automática'}
                </dt>
                <dd className="mt-1 font-medium">
                  {month.alreadyExists
                    ? plantDate(existing?.createdAtUtc ?? null)
                    : `Desde el primer día de ${formatMonth(month.evaluationMonth)}, sujeto al límite de recuperación y a la próxima comprobación habilitada sin conflictos. El servidor no informa una hora exacta de creación.`}
                </dd>
              </div>
              {[
                'Apertura de postulaciones',
                'Cierre de postulaciones',
                'Apertura de opiniones',
                'Cierre de opiniones',
              ].map((label, index) => (
                <div key={label}>
                  <dt className="text-muted">{label}</dt>
                  <dd className="mt-1 font-medium">
                    {dates[index] ? plantDate(dates[index]) : 'Sin horario programado informado'}
                  </dd>
                </div>
              ))}
            </dl>
            {month.conflicts.length > 0 && (
              <div className="mt-4 rounded-xl bg-warning-soft p-3 text-sm text-warning">
                <p className="font-semibold">Conflictos detectados</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {month.conflicts.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            {month.alreadyExists && month.existingCampaignId && (
              <Link className="secondary mt-4" to={`/admin/campaigns/${month.existingCampaignId}`}>
                Consultar convocatoria
              </Link>
            )}
          </article>
        )
      })}
      <Pagination
        pageNumber={page}
        pageSize={pageSize}
        total={preview.months.length}
        onPageChange={setPage}
      />
    </div>
  )
}
