import { useState } from 'react'
import { nominationsApi } from '../nominationsApi'
import type { Candidate, NominationConfirmation } from '../types'
import { qualities, qualityLabels } from '../qualities'
import { ApiError } from '@/shared/api/httpClient'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { PageHeader } from '@/shared/components/PageHeader'
import { DataTable } from '@/shared/components/DataTable'
import { Pagination } from '@/shared/components/Pagination'
import { ListFilters } from '@/shared/components/ListFilters'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatMonth } from '@/shared/utils/formatDate'
export function NominationsPage() {
  const active = useQuery('active', nominationsApi.active)
  const [search, setSearch] = useState({ term: '', page: 1 })
  const candidates = useQuery(
    JSON.stringify(search),
    (signal) => nominationsApi.candidates(search.term, search.page, signal),
    !!search.term && !!active.data,
  )
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [flags, setFlags] = useState(0)
  const [justification, setJustification] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [success, setSuccess] = useState<NominationConfirmation | null>(null)
  const operation = useOperation()
  async function submit(signal: AbortSignal) {
    if (!candidate || !active.data) return
    try {
      const result = await nominationsApi.create(
        { candidateEmployeeId: candidate.id, qualities: flags, justification },
        signal,
      )
      if (!signal.aborted) {
        setSuccess(result)
        setConfirm(false)
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        active.reload()
        setConfirm(false)
      }
      throw error
    }
  }
  if (success)
    return (
      <div className="space-y-4">
        <PageHeader title="Postulación registrada" />
        <p role="status">Registraste a {success.candidate.fullName} en la convocatoria.</p>
        <p>{qualityLabels(success.qualities)}</p>
        <p className="whitespace-pre-wrap">{success.justification}</p>
        <button
          className="primary"
          onClick={() => {
            setSuccess(null)
            setCandidate(null)
            setFlags(0)
            setJustification('')
            operation.clearError()
            active.reload()
          }}
        >
          Postular a otro colaborador
        </button>
      </div>
    )
  return (
    <div className="space-y-4">
      <PageHeader
        title="Postular colaborador"
        description={
          active.data
            ? formatMonth(active.data.evaluationMonth)
            : 'Consulta de convocatoria abierta'
        }
      />
      <button type="button" onClick={active.reload} disabled={active.loading || operation.busy}>
        Actualizar convocatoria
      </button>
      {active.loading && <LoadingState />}
      {active.error && <ErrorState message={active.error} onRetry={active.reload} />}
      {active.data && (
        <>
          <ListFilters requiredTerm onSearch={(term) => setSearch({ term, page: 1 })} />
          {candidates.loading && <LoadingState />}
          {candidates.error && (
            <ErrorState message={candidates.error} onRetry={candidates.reload} />
          )}
          {candidates.data && (
            <>
              <DataTable
                caption="Colaboradores"
                rows={candidates.data.items}
                rowKey={(row) => row.id}
                columns={[
                  { id: 'payroll', header: 'Nómina', cell: (row) => row.payrollNumber },
                  { id: 'name', header: 'Nombre', cell: (row) => row.fullName },
                  {
                    id: 'select',
                    header: 'Seleccionar',
                    cell: (row) => (
                      <button
                        disabled={operation.busy}
                        onClick={() => {
                          if (candidate?.id !== row.id) {
                            setCandidate(row)
                            setFlags(0)
                            setJustification('')
                            operation.clearError()
                          }
                        }}
                      >
                        {candidate?.id === row.id ? 'Seleccionado' : 'Seleccionar'}
                      </button>
                    ),
                  },
                ]}
              />
              <Pagination
                {...candidates.data}
                onPageChange={(page) => setSearch({ ...search, page })}
              />
            </>
          )}
        </>
      )}
      {candidate && (
        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault()
            operation.clearError()
            setConfirm(true)
          }}
        >
          <h2 className="font-semibold">
            {candidate.fullName} · {candidate.payrollNumber}
          </h2>
          <fieldset disabled={operation.busy}>
            <legend>Cualidades</legend>
            {qualities.map((item) => (
              <label key={item.value} className="my-2 flex items-center gap-2">
                <input
                  className="m-0 inline-block w-auto"
                  type="checkbox"
                  checked={(flags & item.value) !== 0}
                  onChange={() => setFlags(flags ^ item.value)}
                />
                {item.label}
              </label>
            ))}
          </fieldset>
          <label htmlFor="justification">Justificación ({justification.length}/500)</label>
          <textarea
            id="justification"
            className="w-full rounded-lg border p-3"
            maxLength={500}
            required
            value={justification}
            disabled={operation.busy}
            onChange={(event) => setJustification(event.target.value)}
          />
          <button
            className="primary"
            disabled={operation.busy || !active.data || !flags || !justification.trim()}
          >
            Revisar y confirmar
          </button>
        </form>
      )}
      {operation.error && (
        <p role="alert" className="text-red-700">
          {operation.error}
        </p>
      )}
      <ConfirmDialog
        open={confirm}
        title="Registrar postulación"
        description={`${candidate?.fullName ?? ''}: ${qualityLabels(flags)}. ${justification}`}
        busy={operation.busy}
        error={operation.error}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void operation.run(submit)}
      />
    </div>
  )
}
