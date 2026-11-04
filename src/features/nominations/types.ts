import type { PaginatedResponse } from '@/shared/api/types'
export interface Candidate {
  id: string
  payrollNumber: string
  fullName: string
}
export interface ActiveCampaign {
  id: string
  evaluationMonth: string
}
export interface NominationInput {
  candidateEmployeeId: string
  qualities: number
  justification: string
}
export interface NominationConfirmation {
  id: string
  campaignId: string
  createdByUserId: string
  sponsor: Candidate
  candidate: Candidate
  qualities: number
  justification: string
  registeredAtUtc: string
  isCancelled: boolean
}
export type CandidatePage = PaginatedResponse<Candidate>
