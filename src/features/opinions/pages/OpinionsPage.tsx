import {
  canWriteOpinion,
  campaignMonth,
  defaultCampaign,
  sortCampaigns,
} from '../campaignSelection'
import { EmptyState } from '@/shared/components/EmptyState'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { opinionsApi } from '../opinionsApi'
import type { OpinionCampaign, OpinionCandidate } from '../types'
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
  const query = useQuery('opinion-campaigns', opinionsApi.campaigns)
  const [selectedId, setSelectedId] = useState('')
  const campaigns = sortCampaigns(query.data ?? [])
  const selected = defaultCampaign(campaigns, selectedId || params.get('campaignId') || undefined)
  return (
    <div>
      <PageHeader
        title="Opiniones departamentales"
        description="Consulta y registra la opinión del departamento de tu cuenta."
      />
      {query.loading && <LoadingState message="Cargando convocatorias…" />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && !campaigns.length && (
        <EmptyState
          title="No hay convocatorias disponibles"
          description="Las convocatorias autorizadas para tu departamento aparecerán aquí."
        />
      )}
      {selected && (
        <>
          <label className="my-5 max-w-xl">
            Convocatoria
            <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>
              {campaigns.map((item) => (
                <option key={item.id} value={item.id}>
                  {campaignMonth(item.evaluationMonth)} ·{' '}
                  {canWriteOpinion(item) ? 'Opiniones abiertas' : 'Opiniones cerradas'}
                  {item.isArchived ? ' · Archivada' : ''}
                </option>
              ))}
            </select>
          </label>
          <StatusBadge tone={canWriteOpinion(selected) ? 'success' : 'neutral'}>
            {canWriteOpinion(selected)
              ? 'Periodo de opiniones abierto'
              : 'Periodo cerrado · Solo consulta'}
          </StatusBadge>
          <CampaignOpinions key={selected.id} campaign={selected} />
        </>
      )}
    </div>
  )
}
function CampaignOpinions({ campaign }: { campaign: OpinionCampaign }) {
  const [filter, setFilter] = useState({ campaignId: campaign.id, term: '', page: 1 })
  const query = useQuery(
    JSON.stringify(filter),
    (signal) => opinionsApi.list(filter.campaignId, filter.term, filter.page, signal),
    !!filter.campaignId,
  )
  const [candidate, setCandidate] = useState<OpinionCandidate | null>(null)
  const [message, setMessage] = useState('')
  return (
    <div>
      <ListFilters onSearch={(term) => setFilter({ campaignId: campaign.id, term, page: 1 })} />{' '}
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
                    {!canWriteOpinion(campaign)
                      ? 'Consultar'
                      : row.hasOpinion
                        ? 'Consultar / editar'
                        : 'Registrar opinión'}
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
          readOnly={!canWriteOpinion(campaign)}
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
