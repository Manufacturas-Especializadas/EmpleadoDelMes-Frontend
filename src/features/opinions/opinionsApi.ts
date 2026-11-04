import { request } from '@/shared/api/httpClient'
import { queryString } from '@/shared/utils/queryString'
import type { Opinion, OpinionPage, OpinionStatus } from './types'
export const opinionsApi = {
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
