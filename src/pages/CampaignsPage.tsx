import { useEffect, useState } from 'react'
import {
  getCampaigns,
  type Campaign,
  type CampaignPage,
  type CampaignPeriod,
} from '@/features/campaigns/campaignsApi'

const PAGE_SIZE = 20

function formatMonth(value: string): string {
  const [year, month] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function formatDate(value: string | null): string {
  if (!value) return 'Sin configurar'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function PeriodStatus({ period, isOpen }: { period: CampaignPeriod; isOpen: boolean }) {
  const modeLabel = {
    0: 'Automático',
    1: 'Apertura manual',
    2: 'Cierre manual',
  }[period.mode]

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {isOpen ? 'Abierto' : 'Cerrado'}
      </span>

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

function CampaignRow({ campaign }: { campaign: Campaign }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-5 py-4">
        <p className="font-semibold capitalize text-slate-900">
          {formatMonth(campaign.evaluationMonth)}
        </p>
      </td>

      <td className="px-5 py-4">
        <PeriodStatus period={campaign.nominationPeriod} isOpen={campaign.canAcceptNominations} />
      </td>

      <td className="px-5 py-4">
        <PeriodStatus period={campaign.opinionPeriod} isOpen={campaign.canAcceptOpinions} />
      </td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            campaign.isArchived ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {campaign.isArchived ? 'Archivada' : 'Vigente'}
        </span>
      </td>
    </tr>
  )
}

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

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Administración</p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">Convocatorias</h1>

          <p className="mt-2 text-sm text-slate-600">
            Consulta los periodos de postulaciones y opiniones de cada convocatoria mensual.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Actualizar
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div role="status" className="p-8 text-center text-slate-600">
            Cargando convocatorias...
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="p-8 text-center">
            <p className="font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-4 text-sm font-semibold text-teal-800 hover:underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && data?.items.length === 0 && (
          <div className="p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No hay convocatorias para mostrar
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Cuando existan convocatorias registradas, aparecerán en este apartado.
            </p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Mes evaluado
                    </th>

                    <th scope="col" className="px-5 py-4 font-semibold">
                      Postulaciones
                    </th>

                    <th scope="col" className="px-5 py-4 font-semibold">
                      Opiniones
                    </th>

                    <th scope="col" className="px-5 py-4 font-semibold">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((campaign) => (
                    <CampaignRow key={campaign.id} campaign={campaign} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
              <p className="text-sm text-slate-600">{data.total} convocatoria(s) registrada(s)</p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading || page === 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="text-sm text-slate-600">
                  Página {page} de {totalPages}
                </span>

                <button
                  type="button"
                  disabled={loading || page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
