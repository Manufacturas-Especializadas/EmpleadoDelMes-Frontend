import type { PaginatedResponse } from '@/shared/api/types'
export interface OpinionCandidate {
  candidateEmployeeId: string
  candidatePayrollNumber: string
  candidateFullName: string
  campaignId: string
  hasOpinion: boolean
}
export interface Opinion {
  id: string
  campaignId: string
  candidateEmployeeId: string
  content: string
  createdAtUtc: string
  lastModifiedAtUtc: string
  version: string
}
export interface OpinionStatus {
  hasOpinion: boolean
  opinion: Opinion | null
  message: string | null
}
export type OpinionPage = PaginatedResponse<OpinionCandidate>
