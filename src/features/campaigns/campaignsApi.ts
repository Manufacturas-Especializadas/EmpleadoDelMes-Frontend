import { request } from '@/shared/api/httpClient'
import type { Campaign, CampaignPage } from './types'

export async function getCampaigns(
  pageNumber = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<CampaignPage> {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
  return (await request<CampaignPage>(`/api/campaigns?${params}`, { authenticated: true, signal }))
    .data
}

export type CampaignAction =
  | `${'nominations' | 'opinions'}/${'open' | 'close' | 'automatic' | 'schedule'}`
  | 'archive'
  | 'reopen'
export async function getCampaign(id: string, signal: AbortSignal) {
  return (await request<Campaign>(`/api/campaigns/${id}`, { authenticated: true, signal })).data
}
export async function changeCampaign(
  id: string,
  action: CampaignAction,
  body: { version: string; openingAt?: string; closingAt?: string },
  signal: AbortSignal,
) {
  return (
    await request<Campaign>(`/api/campaigns/${id}/${action}`, {
      method: action.endsWith('/schedule') ? 'PUT' : 'POST',
      body,
      authenticated: true,
      signal,
    })
  ).data
}
