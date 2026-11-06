import { request } from '@/shared/api/httpClient'
import type { PaginatedResponse } from '@/shared/api/types'
import type { Opinion, OpinionPage, OpinionStatus } from '@/features/opinions/types'
import { queryString } from '@/shared/utils/queryString'
export interface SupervisorCampaign {
  id: string
  evaluationMonth: string
  isArchived: boolean
}
export const supervisorApi = {
  campaigns: async (signal: AbortSignal) => {
    const items: SupervisorCampaign[] = []
    for (let pageNumber = 1; ; pageNumber++) {
      signal.throwIfAborted()
      const { data } = await request<PaginatedResponse<SupervisorCampaign>>(
        `/api/supervisor-opinions/campaigns?${queryString({ pageNumber, pageSize: 100 })}`,
        { authenticated: true, signal },
      )
      if (data.pageNumber !== pageNumber || data.pageSize < 1)
        throw new Error('Paginación de convocatorias no válida.')
      items.push(...data.items)
      if (!data.items.length || data.pageNumber * data.pageSize >= data.total) break
    }
    return [...new Map(items.map((item) => [item.id, item])).values()].sort((a, b) =>
      b.evaluationMonth.localeCompare(a.evaluationMonth),
    )
  },
  list: async (
    campaignId: string,
    term: string,
    pageNumber: number,
    hasOpinion: string,
    signal: AbortSignal,
  ) =>
    (
      await request<OpinionPage>(
        `/api/supervisor-opinions/candidates?${queryString({ campaignId, term, pageNumber })}${hasOpinion ? `&hasOpinion=${hasOpinion}` : ''}`,
        { authenticated: true, signal },
      )
    ).data,
  get: async (campaignId: string, candidateId: string, signal: AbortSignal) =>
    (
      await request<OpinionStatus>(`/api/supervisor-opinions/${campaignId}/${candidateId}`, {
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
      await request<Opinion>(`/api/supervisor-opinions/${campaignId}/${candidateId}`, {
        method: 'PUT',
        body: { content, version },
        authenticated: true,
        signal,
      })
    ).data,
}
