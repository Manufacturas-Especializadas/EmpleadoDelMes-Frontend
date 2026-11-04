import { request } from '@/shared/api/httpClient'
import { queryString } from '@/shared/utils/queryString'
import type { NominationCandidatePage, Preselection } from './types'
export const preselectionsApi = {
  list: async (campaignId: string, term: string, pageNumber: number, signal: AbortSignal) =>
    (
      await request<NominationCandidatePage>(
        `/api/admin/nominations/candidates?${queryString({ campaignId, term, pageNumber })}`,
        { authenticated: true, signal },
      )
    ).data,
  change: async (
    campaignId: string,
    candidateId: string,
    select: boolean,
    version: string | null,
    signal: AbortSignal,
  ) =>
    (
      await request<Preselection>(
        `/api/admin/preselections/${campaignId}/${candidateId}/${select ? 'select' : 'withdraw'}`,
        { method: 'POST', body: { version }, authenticated: true, signal },
      )
    ).data,
}
