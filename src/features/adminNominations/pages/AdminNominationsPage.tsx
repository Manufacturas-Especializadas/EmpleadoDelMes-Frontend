import { useState } from 'react'
import { CampaignSelector } from '@/shared/components/CampaignSelector'
import { adminNominationsApi } from '../adminNominationsApi'
import { NominationEditor } from '../components/NominationEditor'
import { useQuery } from '@/shared/hooks/useQuery'
import { PageHeader } from '@/shared/components/PageHeader'
import { SearchInput } from '@/shared/components/SearchInput'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatDate } from '@/shared/utils/formatDate'
export function AdminNominationsPage() {
  return <CampaignSelector allowAll>{(id) => <CampaignContent campaignId={id} />}</CampaignSelector>
}
function CampaignContent({ campaignId }: { campaignId: string }) {
  const [filter, setFilter] = useState({
    campaignId: campaignId,
    term: '',
    status: '',
    page: 1,
  })
  const [term, setTerm] = useState(''),
    [status, setStatus] = useState(''),
    [id, setId] = useState<string | null>(null)
  const query = useQuery(JSON.stringify(filter), (signal) =>
    adminNominationsApi.list(filter.campaignId, filter.term, filter.status, filter.page, signal),
  )
  return (
    <div>
      <PageHeader title="Administración de postulaciones" />
      <form
        className="my-4 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setFilter({ campaignId: campaignId.trim(), term: term.trim(), status, page: 1 })
        }}
      >
        <SearchInput label="Nombre o nómina" value={term} onValueChange={setTerm} maxLength={100} />
        <label>
          Estado
          <select
            className="block rounded border p-3"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Todas</option>
            <option value="false">Vigentes</option>
            <option value="true">Anuladas</option>
          </select>
        </label>
        <button className="primary">Buscar</button>
      </form>
      {query.loading && <LoadingState />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Postulaciones"
            rows={query.data.items}
            rowKey={(row) => row.id}
            columns={[
              {
                id: 'candidate',
                header: 'Candidato',
                cell: (row) => row.candidateFullName + ' · ' + row.candidatePayrollNumber,
              },
              {
                id: 'sponsor',
                header: 'Patrocinador',
                cell: (row) => row.sponsorFullName + ' · ' + row.sponsorPayrollNumber,
              },
              { id: 'date', header: 'Fecha', cell: (row) => formatDate(row.registeredAtUtc) },
              {
                id: 'status',
                header: 'Estado',
                cell: (row) => (
                  <StatusBadge tone={row.isCancelled ? 'warning' : 'success'}>
                    {row.isCancelled ? 'Anulada' : 'Vigente'}
                  </StatusBadge>
                ),
              },
              {
                id: 'detail',
                header: 'Detalle',
                cell: (row) => <button onClick={() => setId(row.id)}>Consultar</button>,
              },
            ]}
          />
          <Pagination {...query.data} onPageChange={(page) => setFilter({ ...filter, page })} />
        </>
      )}
      {id && <NominationEditor id={id} onClose={() => setId(null)} onSaved={query.reload} />}
    </div>
  )
}
