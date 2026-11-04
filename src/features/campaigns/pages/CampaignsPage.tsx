import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getCampaigns } from '../campaignsApi'
import type { Campaign, CampaignPage, CampaignPeriod } from '../types'
import { formatDate, formatMonth } from '@/shared/utils/formatDate'
import { PageHeader } from '@/shared/components/PageHeader'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
const PAGE_SIZE = 20
function PeriodStatus({ period, isOpen }: { period: CampaignPeriod; isOpen: boolean }) {
  const modeLabel = {
    0: 'Automático',
    1: 'Apertura manual',
    2: 'Cierre manual',
  }[period.mode]

  return (
    <div className="space-y-1">
      <StatusBadge tone={isOpen ? 'success' : 'neutral'}>
        {isOpen ? 'Abierto' : 'Cerrado'}
      </StatusBadge>

      <p className="text-xs text-slate-500">{modeLabel}</p>

      {period.scheduledOpeningAtUtc && period.scheduledClosingAtUtc && (
        <p className="text-xs text-slate-500">
          {formatDate(period.scheduledOpeningAtUtc)}
          {' — '}
          {formatDate(period.scheduledClosingAtUtc)}
        </p>
      )}
    </div>
  )
}

const columns: Column<Campaign>[] = [
  {
    id: 'detail',
    header: 'Detalle',
    cell: (campaign) => (
      <Link className="text-teal-800 underline" to={`/admin/campaigns/${campaign.id}`}>
        Administrar
      </Link>
    ),
  },
  {
    id: 'month',
    header: 'Mes evaluado',
    cell: (campaign) => (
      <span className="font-semibold capitalize">{formatMonth(campaign.evaluationMonth)}</span>
    ),
  },
  {
    id: 'nominations',
    header: 'Postulaciones',
    cell: (campaign) => (
      <PeriodStatus period={campaign.nominationPeriod} isOpen={campaign.canAcceptNominations} />
    ),
  },
  {
    id: 'opinions',
    header: 'Opiniones',
    cell: (campaign) => (
      <PeriodStatus period={campaign.opinionPeriod} isOpen={campaign.canAcceptOpinions} />
    ),
  },
  {
    id: 'status',
    header: 'Estado',
    cell: (campaign) => (
      <StatusBadge tone={campaign.isArchived ? 'warning' : 'info'}>
        {campaign.isArchived ? 'Archivada' : 'Vigente'}
      </StatusBadge>
    ),
  },
]
export function CampaignsPage() {
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [data, setData] = useState<CampaignPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCampaigns() {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const result = await getCampaigns(page, PAGE_SIZE, controller.signal)

        if (!controller.signal.aborted) {
          setData(result)
        }
      } catch (error) {
        if (controller.signal.aborted) return

        setError(
          error instanceof Error ? error.message : 'No fue posible consultar las convocatorias.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadCampaigns()

    return () => controller.abort()
  }, [page, refreshKey])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convocatorias"
        eyebrow="Administración"
        description="Consulta los periodos de postulaciones y opiniones de cada convocatoria mensual."
        actions={
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
            className="border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700"
          >
            Actualizar
          </button>
        }
      />
      <section
        aria-label="Listado de convocatorias"
        aria-busy={loading}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {loading ? (
          <LoadingState message="Cargando convocatorias..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setRefreshKey((value) => value + 1)} />
        ) : (
          data && (
            <>
              <DataTable
                caption="Convocatorias"
                rows={data.items}
                columns={columns}
                rowKey={(campaign) => campaign.id}
                emptyState={
                  <EmptyState
                    title="No hay convocatorias para mostrar"
                    description="Cuando existan convocatorias registradas, aparecerán en este apartado."
                  />
                }
              />
              <Pagination
                pageNumber={data.pageNumber}
                pageSize={data.pageSize}
                total={data.total}
                onPageChange={setPage}
              />
            </>
          )
        )}
      </section>
    </div>
  )
}
