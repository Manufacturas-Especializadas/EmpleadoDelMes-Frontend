import { request } from '@/shared/api/httpClient'
import { queryString } from '@/shared/utils/queryString'
import type { PaginatedResponse } from '@/shared/api/types'
import type { AdminNomination, AdminNominationDetail, CorrectionResult } from './types'
export const adminNominationsApi = {
  list: async (
    campaignId: string,
    term: string,
    isCancelled: string,
    pageNumber: number,
    signal: AbortSignal,
  ) => {
    const params = new URLSearchParams(queryString({ campaignId, term, pageNumber }))
    if (isCancelled) params.set('isCancelled', isCancelled)
    return (
      await request<PaginatedResponse<AdminNomination>>(`/api/admin/nominations?${params}`, {
        authenticated: true,
        signal,
      })
    ).data
  },
  get: async (id: string, signal: AbortSignal) =>
    (
      await request<AdminNominationDetail>(`/api/admin/nominations/${id}`, {
        authenticated: true,
        signal,
      })
    ).data,
  correct: async (
    id: string,
    body: { version: string; qualities: number; justification: string; reason: string },
    signal: AbortSignal,
  ) =>
    (
      await request<CorrectionResult>(`/api/admin/nominations/${id}/correction`, {
        method: 'PUT',
        body,
        authenticated: true,
        signal,
      })
    ).data,
  cancel: async (id: string, version: string, reason: string, signal: AbortSignal) =>
    (
      await request<AdminNominationDetail>(`/api/admin/nominations/${id}/cancel`, {
        method: 'POST',
        body: { version, reason },
        authenticated: true,
        signal,
      })
    ).data,
}
