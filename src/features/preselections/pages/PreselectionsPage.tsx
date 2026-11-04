import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { preselectionsApi } from '../preselectionsApi'
import type { NominationCandidate } from '../types'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { ApiError } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListFilters } from '@/shared/components/ListFilters'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
export function PreselectionsPage() {
  const [params] = useSearchParams()
  const [filter, setFilter] = useState({
    campaignId: params.get('campaignId') ?? '',
    term: '',
    page: 1,
  })
  const query = useQuery(
    JSON.stringify(filter),
    (signal) => preselectionsApi.list(filter.campaignId, filter.term, filter.page, signal),
    !!filter.campaignId,
  )
  const [selected, setSelected] = useState<NominationCandidate | null>(null)
  const [message, setMessage] = useState('')
  const operation = useOperation()
  async function change(signal: AbortSignal) {
    if (!selected) return
    try {
      await preselectionsApi.change(
        selected.campaignId,
        selected.candidateEmployeeId,
        !selected.isPreselected,
        selected.preselectionVersion,
        signal,
      )
      if (!signal.aborted) {
        setSelected(null)
        setMessage('Preselección actualizada.')
        query.reload()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSelected(null)
        query.reload()
        setMessage(
          'La preselección cambió. Revisa la lista actualizada antes de confirmar otra operación.',
        )
      }
      throw error
    }
  }
  return (
    <div>
      <PageHeader title="Preselección administrativa" />
      <ListFilters
        campaign
        initialCampaign={filter.campaignId}
        onSearch={(term, campaignId) => {
          setFilter({ term, campaignId, page: 1 })
          setMessage('')
        }}
      />
      {!filter.campaignId && (
        <p>Selecciona una convocatoria desde su detalle o introduce su identificador.</p>
      )}
      {message && <p role="status">{message}</p>}
      {operation.error && !selected && <p role="alert">{operation.error}</p>}
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Candidatos para preselección"
            rows={query.data.items}
            rowKey={(row) => row.candidateEmployeeId}
            columns={[
              { id: 'payroll', header: 'Nómina', cell: (row) => row.candidatePayrollNumber },
              { id: 'name', header: 'Nombre', cell: (row) => row.candidateFullName },
              {
                id: 'count',
                header: 'Postulaciones válidas',
                cell: (row) => row.validNominationsCount,
              },
              {
                id: 'status',
                header: 'Estado',
                cell: (row) => (
                  <StatusBadge tone={row.isPreselected ? 'success' : 'neutral'}>
                    {row.isPreselected ? 'Preseleccionado' : 'Sin preselección'}
                  </StatusBadge>
                ),
              },
              {
                id: 'action',
                header: 'Acción',
                cell: (row) => (
                  <button
                    disabled={operation.busy}
                    onClick={() => {
                      operation.clearError()
                      setSelected(row)
                    }}
                  >
                    {row.isPreselected ? 'Retirar' : 'Preseleccionar'}
                  </button>
                ),
              },
            ]}
          />
          <Pagination {...query.data} onPageChange={(page) => setFilter({ ...filter, page })} />
        </>
      )}
      <ConfirmDialog
        open={!!selected}
        title={selected?.isPreselected ? 'Retirar preselección' : 'Preseleccionar candidato'}
        description={selected?.candidateFullName ?? ''}
        onCancel={() => setSelected(null)}
        onConfirm={() => void operation.run(change)}
        busy={operation.busy}
        error={operation.error}
      />
    </div>
  )
}
