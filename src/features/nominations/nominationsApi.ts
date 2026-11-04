import { request } from '@/shared/api/httpClient'
import { queryString } from '@/shared/utils/queryString'
import type {
  ActiveCampaign,
  CandidatePage,
  NominationInput,
  NominationConfirmation,
} from './types'
export const nominationsApi = {
  active: async (signal: AbortSignal) =>
    (
      await request<ActiveCampaign>('/api/nominations/active-campaign', {
        authenticated: true,
        signal,
      })
    ).data,
  candidates: async (term: string, pageNumber: number, signal: AbortSignal) =>
    (
      await request<CandidatePage>(
        `/api/nominations/candidates?${queryString({ term, pageNumber })}`,
        { authenticated: true, signal },
      )
    ).data,
  create: async (body: NominationInput, signal: AbortSignal) =>
    (
      await request<NominationConfirmation>('/api/nominations', {
        method: 'POST',
        body,
        authenticated: true,
        signal,
      })
    ).data,
}
