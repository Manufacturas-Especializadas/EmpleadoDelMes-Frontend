import type { PaginatedResponse } from '@/shared/api/types'
import type { OpinionCampaign } from './types'
import { request } from '@/shared/api/httpClient'
import { queryString } from '@/shared/utils/queryString'
import type { Opinion, OpinionPage, OpinionStatus } from './types'
export const opinionsApi = {
  campaigns: async (signal: AbortSignal): Promise<OpinionCampaign[]> => {
    const items: OpinionCampaign[] = []
    let pageNumber = 1
    while (true) {
      signal.throwIfAborted()
      const { data } = await request<PaginatedResponse<OpinionCampaign>>(
        `/api/opinions/campaigns?${queryString({ pageNumber })}`,
        { authenticated: true, signal },
      )
      items.push(...data.items)
      if (!data.items.length || data.pageNumber * data.pageSize >= data.total) break
      if (data.pageNumber !== pageNumber || data.pageSize < 1)
        throw new Error('No pudimos cargar las convocatorias. Inténtalo nuevamente.')
      pageNumber++
    }
    return [...new Map(items.map((item) => [item.id, item])).values()]
  },
  list: async (campaignId: string, term: string, pageNumber: number, signal: AbortSignal) =>
    (
      await request<OpinionPage>(
        `/api/opinions/candidates?${queryString({ campaignId, term, pageNumber })}`,
        { authenticated: true, signal },
      )
    ).data,
  get: async (campaignId: string, candidateId: string, signal: AbortSignal) =>
    (
      await request<OpinionStatus>(`/api/opinions/${campaignId}/${candidateId}`, {
        authenticated: true,
        signal,
      })
    ).data,
  save: async (
    campaignId: string,
    candidateId: string,
    content: string,
    version: string | null,
    signal: AbortSignal,
  ) =>
    (
      await request<Opinion>(`/api/opinions/${campaignId}/${candidateId}`, {
        method: 'PUT',
        body: { content, version },
        authenticated: true,
        signal,
      })
    ).data,
}
