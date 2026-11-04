import { request } from '@/shared/api/httpClient'
import { queryString } from '@/shared/utils/queryString'
import type { ReviewPage, ReviewDetail } from './types'
export const reviewApi = {
  list: async (campaignId: string, term: string, pageNumber: number, signal: AbortSignal) =>
    (
      await request<ReviewPage>(
        `/api/admin/candidates/review?${queryString({ campaignId, term, pageNumber })}`,
        { authenticated: true, signal },
      )
    ).data,
  get: async (campaignId: string, candidateId: string, signal: AbortSignal) =>
    (
      await request<ReviewDetail>(`/api/admin/candidates/${campaignId}/${candidateId}/review`, {
        authenticated: true,
        signal,
      })
    ).data,
}
