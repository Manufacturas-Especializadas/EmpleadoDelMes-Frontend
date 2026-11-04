import type { PaginatedResponse } from '@/shared/api/types'
export interface ReviewCandidate {
  campaignId: string
  candidateEmployeeId: string
  candidatePayrollNumber: string
  candidateFullName: string
  validNominationsCount: number
  humanResourcesHasOpinion: boolean
  safetyHasOpinion: boolean
  qualityHasOpinion: boolean
}
export interface ReviewNomination {
  id: string
  sponsorPayrollNumber: string
  sponsorFullName: string
  qualities: number
  justification: string
  registeredAtUtc: string
}
export interface ReviewOpinion {
  opinionSource: 1 | 2 | 3 | 4
  hasOpinion: boolean
  content: string | null
  createdAtUtc: string | null
  lastModifiedAtUtc: string | null
}
export interface ReviewDetail {
  campaignId: string
  evaluationMonth: string
  candidateEmployeeId: string
  candidatePayrollNumber: string
  candidateFullName: string
  isPreselected: boolean
  validNominationsCount: number
  nominations: ReviewNomination[]
  opinions: ReviewOpinion[]
}
export type ReviewPage = PaginatedResponse<ReviewCandidate>
