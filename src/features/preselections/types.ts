import type { PaginatedResponse } from '@/shared/api/types'
export interface NominationCandidate {
  campaignId: string
  candidateEmployeeId: string
  candidatePayrollNumber: string
  candidateFullName: string
  validNominationsCount: number
  isPreselected: boolean
  preselectionVersion: string | null
}
export interface Preselection {
  campaignId: string
  candidateEmployeeId: string
  isSelected: boolean
  lastChangedByUserId: string
  lastChangedAtUtc: string
  version: string
}
export type NominationCandidatePage = PaginatedResponse<NominationCandidate>
