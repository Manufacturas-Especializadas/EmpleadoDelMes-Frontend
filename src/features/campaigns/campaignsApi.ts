import { getAccessToken } from '@/features/auth/session'
import { request } from '@/shared/api/httpClient'

export type CampaignPeriodMode = 0 | 1 | 2

export interface CampaignPeriod {
  mode: CampaignPeriodMode
  scheduledOpeningAtUtc: string | null
  scheduledClosingAtUtc: string | null
}

export interface Campaign {
  id: string
  evaluationMonth: string
  createdAtUtc: string
  isArchived: boolean
  nominationPeriod: CampaignPeriod
  opinionPeriod: CampaignPeriod
  version: string
  canAcceptNominations: boolean
  canAcceptOpinions: boolean
}

export interface CampaignPage {
  items: Campaign[]
  total: number
  pageNumber: number
  pageSize: number
}

export async function getCampaigns(
  pageNumber = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<CampaignPage> {
  const token = getAccessToken()

  if (!token) {
    throw new Error('Debes iniciar sesión para consultar las convocatorias.')
  }

  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })

  const response = await request<CampaignPage>(`/api/campaigns?${params.toString()}`, {
    token,
    signal,
  })

  return response.data
}
