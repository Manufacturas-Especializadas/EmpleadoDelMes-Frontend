import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { OpinionEditor } from '@/features/opinions/components/OpinionEditor'
import type { OpinionCandidate } from '@/features/opinions/types'
import { useQuery } from '@/shared/hooks/useQuery'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListFilters } from '@/shared/components/ListFilters'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { SuccessMessage } from '@/shared/components/SuccessMessage'
import { formatMonth } from '@/shared/utils/formatDate'
import { assignmentDemo } from '@/features/sponsorAssignments/api'
import { supervisorApi, type SupervisorCampaign } from './api'
export function SupervisorOpinionsPage() {
  const [params, setParams] = useSearchParams()
  const query = useQuery('supervisor-campaigns', supervisorApi.campaigns, !assignmentDemo)
  const id = params.get('campaignId')
  const selected = id
    ? query.data?.find((c) => c.id === id)
    : (query.data?.find((c) => !c.isArchived) ?? query.data?.[0])
  return (
    <div className="space-y-5">
      <PageHeader
        title="Mis colaboradores"
        description="Consulta a tus colaboradores preseleccionados y registra tu opinión como jefe inmediato."
      />
      {assignmentDemo ? (
        <EmptyState
          title="Requiere conexión con el backend"
          description="Este módulo no simula asignaciones ni opiniones."
        />
      ) : (
        <>
          {query.loading && <LoadingState />}
          {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
          {query.data && !query.data.length && (
            <EmptyState
              title="No tienes colaboradores preseleccionados disponibles"
              description="Se requiere una vinculación de evaluador y una postulación válida. Consulta con Administración si esperabas ver un colaborador."
            />
          )}
          {!!query.data?.length && (
            <label>
              Convocatoria
              <select
                value={selected?.id ?? ''}
                onChange={(e) => setParams({ campaignId: e.target.value })}
              >
                <option value="" disabled>
                  Selecciona una convocatoria
                </option>
                {query.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatMonth(c.evaluationMonth)}
                    {c.isArchived ? ' · Archivada' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          {id && query.data && !selected && (
            <ErrorState message="La convocatoria indicada no está disponible para tu cuenta. Selecciona otra convocatoria." />
          )}
          {selected && <Candidates key={selected.id} campaign={selected} />}
        </>
      )}
    </div>
  )
}
function Candidates({ campaign }: { campaign: SupervisorCampaign }) {
  const [filter, setFilter] = useState({ term: '', page: 1, hasOpinion: '' })
  const [candidate, setCandidate] = useState<OpinionCandidate | null>(null)
  const [message, setMessage] = useState('')
  const query = useQuery(JSON.stringify([campaign.id, filter]), (signal) =>
    supervisorApi.list(campaign.id, filter.term, filter.page, filter.hasOpinion, signal),
  )
  return (
    <div className="space-y-4">
      <StatusBadge>
        {campaign.isArchived
          ? 'Archivada · solo consulta'
          : 'El servidor valida el periodo al guardar'}
      </StatusBadge>
      {!campaign.isArchived && (
        <p className="text-sm text-muted">
          La API no informa si el periodo está abierto. Solo permitirá guardar mientras siga abierto
          y seas el evaluador autorizado.
        </p>
      )}
      <ListFilters
        onSearch={(term) => {
          setCandidate(null)
          setFilter({ ...filter, term, page: 1 })
        }}
      />
      <label>
        Estado de opinión
        <select
          value={filter.hasOpinion}
          onChange={(e) => {
            setCandidate(null)
            setFilter({ ...filter, hasOpinion: e.target.value, page: 1 })
          }}
        >
          <option value="">Todas</option>
          <option value="false">Pendientes</option>
          <option value="true">Registradas</option>
        </select>
      </label>
      {message && <SuccessMessage>{message}</SuccessMessage>}
      {query.loading && <LoadingState variant="table" />}
      {query.error && <ErrorState message={query.error} onRetry={query.reload} />}
      {query.data && (
        <>
          <DataTable
            caption="Colaboradores preseleccionados"
            rows={query.data.items}
            rowKey={(row) => row.candidateEmployeeId}
            emptyState={
              <EmptyState
                title="No hay colaboradores para estos filtros"
                description="Solo se muestran preseleccionados elegibles vinculados a tu cuenta."
              />
            }
            columns={[
              { id: 'payroll', header: 'Nómina', cell: (row) => row.candidatePayrollNumber },
              { id: 'name', header: 'Nombre', cell: (row) => row.candidateFullName },
              {
                id: 'status',
                header: 'Opinión',
                cell: (row) => (
                  <StatusBadge tone={row.hasOpinion ? 'success' : 'warning'}>
                    {row.hasOpinion ? 'Registrada' : 'Pendiente'}
                  </StatusBadge>
                ),
              },
              {
                id: 'action',
                header: 'Acción',
                cell: (row) => (
                  <button
                    className="secondary"
                    onClick={() => {
                      setMessage('')
                      setCandidate(row)
                    }}
                  >
                    {campaign.isArchived
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
          api={supervisorApi}
          onConflict={() => {
            query.reload()
            setMessage('')
          }}
          label="Opinión del jefe inmediato"
          candidate={candidate}
          readOnly={campaign.isArchived}
          onClose={() => setCandidate(null)}
          onSaved={() => {
            query.reload()
            setMessage('Opinión guardada correctamente.')
          }}
        />
      )}
    </div>
  )
}
