import type { OpinionCampaign } from '@/features/opinions/types'
import { getCampaigns } from '@/features/campaigns/campaignsApi'
import { opinionsApi } from '@/features/opinions/opinionsApi'
export type CampaignScope = 'admin' | 'opinions'
export function canLoadCampaigns(scope: CampaignScope, roles: string[]) {
  return scope === 'admin'
    ? roles.some((role) => ['Administrator', 'Organizer'].includes(role))
    : roles.some((role) => ['HumanResources', 'Safety', 'Quality'].includes(role))
}
export async function loadCampaignOptions(
  scope: CampaignScope,
  signal: AbortSignal,
): Promise<OpinionCampaign[]> {
  if (scope === 'opinions') return opinionsApi.campaigns(signal)
  const items: OpinionCampaign[] = []
  for (let page = 1; ; page++) {
    signal.throwIfAborted()
    const data = await getCampaigns(page, 100, signal)
    if (data.pageNumber !== page || data.pageSize < 1)
      throw new Error('No pudimos cargar las convocatorias.')
    items.push(...data.items)
    if (!data.items.length || page * data.pageSize >= data.total) break
  }
  return [...new Map(items.map((item) => [item.id, item])).values()]
}
export function selectCampaignId(
  items: OpinionCampaign[],
  requested: string | null,
  allowAll = false,
) {
  if (requested === 'all' && allowAll) return ''
  if (requested && items.some((item) => item.id === requested)) return requested
  const sorted = [...items].sort((a, b) => b.evaluationMonth.localeCompare(a.evaluationMonth))
  return (sorted.find((item) => !item.isArchived) ?? sorted[0])?.id ?? ''
}
