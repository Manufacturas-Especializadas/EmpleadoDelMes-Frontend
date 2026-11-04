import type { Identifier, PaginatedResponse } from '@/shared/api/types'
export type CampaignPeriodMode = 0 | 1 | 2

export interface CampaignPeriod {
  mode: CampaignPeriodMode
  scheduledOpeningAtUtc: string | null
  scheduledClosingAtUtc: string | null
}

export interface Campaign {
  id: Identifier
  evaluationMonth: string
  createdAtUtc: string
  isArchived: boolean
  nominationPeriod: CampaignPeriod
  opinionPeriod: CampaignPeriod
  version: string
  canAcceptNominations: boolean
  canAcceptOpinions: boolean
}

export type CampaignPage = PaginatedResponse<Campaign>
