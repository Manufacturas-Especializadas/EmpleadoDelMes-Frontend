import { Fragment, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '@/features/auth'
import { campaignMonth, sortCampaigns } from '@/features/opinions/campaignSelection'
import {
  canLoadCampaigns,
  loadCampaignOptions,
  selectCampaignId,
  type CampaignScope,
} from '@/shared/api/campaignOptions'
import { useQuery } from '@/shared/hooks/useQuery'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
/** One query owner per screen; keyed content resets dependent state and aborts previous requests. */
export function CampaignSelector({
  scope = 'admin',
  allowAll = false,
  children,
}: {
  scope?: CampaignScope
  allowAll?: boolean
  children: (campaignId: string) => ReactNode
}) {
  const user = useAuth()
  const allowed = canLoadCampaigns(scope, user?.roles ?? [])
  const [params, setParams] = useSearchParams()
  const query = useQuery(
    `${scope}:${user?.userId}`,
    (signal) => loadCampaignOptions(scope, signal),
    allowed,
  )
  if (!allowed)
    return <ErrorState message="No tienes permiso para consultar estas convocatorias." />
  if (query.loading) return <LoadingState message="Cargando convocatorias…" />
  if (query.error) return <ErrorState message={query.error} onRetry={query.reload} />
  const items = sortCampaigns(query.data ?? [])
  if (!items.length)
    return (
      <EmptyState
        title="No hay convocatorias disponibles"
        description="Las convocatorias autorizadas aparecerán aquí."
      />
    )
  const requested = params.get('campaignId')
  const id = selectCampaignId(items, requested, allowAll)
  const missing = requested && requested !== 'all' && !items.some((item) => item.id === requested)
  return (
    <>
      {missing && (
        <p role="status">
          La convocatoria del enlace no está disponible. Se muestra una convocatoria disponible.
        </p>
      )}
      <label className="my-5 max-w-xl">
        Convocatoria
        <select
          value={id}
          onChange={(event) => {
            const next = new URLSearchParams(params)
            next.set('campaignId', event.target.value || 'all')
            setParams(next)
          }}
        >
          {allowAll && <option value="">Todas las convocatorias</option>}
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {campaignMonth(item.evaluationMonth)}
              {item.isArchived ? ' · Archivada' : ''}
            </option>
          ))}
        </select>
      </label>
      <Fragment key={id}>{children(id)}</Fragment>
    </>
  )
}
