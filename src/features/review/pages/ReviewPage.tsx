import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { reviewApi } from '../reviewApi'
import type { ReviewCandidate } from '../types'
import { ReviewDetail } from '../components/ReviewDetail'
import { useQuery } from '@/shared/hooks/useQuery'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListFilters } from '@/shared/components/ListFilters'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
function OpinionBadge({ value }: { value: boolean }) {
  return (
    <StatusBadge tone={value ? 'success' : 'warning'}>
      {value ? 'Registrada' : 'Pendiente'}
    </StatusBadge>
  )
}
export function ReviewPage() {
  const [params] = useSearchParams()
  const [filter, setFilter] = useState({
    campaignId: params.get('campaignId') ?? '',
    term: '',
    page: 1,
  })
  const query = useQuery(
    JSON.stringify(filter),
    (signal) => reviewApi.list(filter.campaignId, filter.term, filter.page, signal),
    !!filter.campaignId,
  )
  const [candidate, setCandidate] = useState<ReviewCandidate | null>(null)
  return (
    <div>
      <PageHeader
        title="Revisión integral"
        description="Consulta de candidatos preseleccionados, postulaciones válidas y opiniones disponibles."
      />
      <ListFilters
        campaign
        initialCampaign={filter.campaignId}
        onSearch={(term, campaignId) => setFilter({ term, campaignId, page: 1 })}
      />
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Revisión de candidatos"
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
                id: 'hr',
                header: 'RH',
                cell: (row) => <OpinionBadge value={row.humanResourcesHasOpinion} />,
              },
              {
                id: 'safety',
                header: 'Seguridad',
                cell: (row) => <OpinionBadge value={row.safetyHasOpinion} />,
              },
              {
                id: 'quality',
                header: 'Calidad',
                cell: (row) => <OpinionBadge value={row.qualityHasOpinion} />,
              },
              {
                id: 'detail',
                header: 'Detalle',
                cell: (row) => <button onClick={() => setCandidate(row)}>Consultar</button>,
              },
            ]}
          />
          <Pagination {...query.data} onPageChange={(page) => setFilter({ ...filter, page })} />
        </>
      )}
      {candidate && <ReviewDetail candidate={candidate} onClose={() => setCandidate(null)} />}
    </div>
  )
}
