import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { opinionsApi } from '../opinionsApi'
import type { OpinionCandidate } from '../types'
import { OpinionEditor } from '../components/OpinionEditor'
import { useQuery } from '@/shared/hooks/useQuery'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListFilters } from '@/shared/components/ListFilters'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
export function OpinionsPage() {
  const [params] = useSearchParams()
  const [filter, setFilter] = useState({
    campaignId: params.get('campaignId') ?? '',
    term: '',
    page: 1,
  })
  const query = useQuery(
    JSON.stringify(filter),
    (signal) => opinionsApi.list(filter.campaignId, filter.term, filter.page, signal),
    !!filter.campaignId,
  )
  const [candidate, setCandidate] = useState<OpinionCandidate | null>(null)
  const [message, setMessage] = useState('')
  return (
    <div>
      <PageHeader
        title="Opiniones departamentales"
        description="Consulta y registra la opinión del departamento de tu cuenta."
      />
      <ListFilters
        campaign
        initialCampaign={filter.campaignId}
        onSearch={(term, campaignId) => setFilter({ term, campaignId, page: 1 })}
      />
      {message && <p role="status">{message}</p>}
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Candidatos preseleccionados"
            rows={query.data.items}
            rowKey={(row) => row.candidateEmployeeId}
            columns={[
              { id: 'payroll', header: 'Nómina', cell: (row) => row.candidatePayrollNumber },
              { id: 'name', header: 'Nombre', cell: (row) => row.candidateFullName },
              {
                id: 'status',
                header: 'Opinión propia',
                cell: (row) => (
                  <StatusBadge tone={row.hasOpinion ? 'success' : 'warning'}>
                    {row.hasOpinion ? 'Registrada' : 'Pendiente'}
                  </StatusBadge>
                ),
              },
              {
                id: 'open',
                header: 'Acción',
                cell: (row) => (
                  <button
                    onClick={() => {
                      setMessage('')
                      setCandidate(row)
                    }}
                  >
                    {row.hasOpinion ? 'Consultar / editar' : 'Registrar opinión'}
                  </button>
                ),
              },
            ]}
          />
          <Pagination {...query.data} onPageChange={(page) => setFilter({ ...filter, page })} />
        </>
      )}
      {candidate && (
        <OpinionEditor
          key={candidate.candidateEmployeeId}
          candidate={candidate}
          onClose={() => setCandidate(null)}
          onSaved={() => {
            query.reload()
            setMessage('Consulta actualizada.')
          }}
        />
      )}
    </div>
  )
}
