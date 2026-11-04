export interface AdminNomination {
  id: string
  campaignId: string
  evaluationMonth: string
  sponsorEmployeeId: string
  sponsorPayrollNumber: string
  sponsorFullName: string
  candidateEmployeeId: string
  candidatePayrollNumber: string
  candidateFullName: string
  qualities: number
  registeredAtUtc: string
  isCancelled: boolean
}
export interface AdminNominationDetail {
  nomination: AdminNomination
  createdByUserId: string
  justification: string
  version: string
}
export interface CorrectionResult {
  detail: AdminNominationDetail
  changed: boolean
  message: string
}
