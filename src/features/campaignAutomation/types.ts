import type { Campaign } from '@/features/campaigns/types'

export interface AutomationCalendar {
  nominationOpeningDayOffset: number | null
  nominationOpeningLocalTime: string | null
  nominationClosingDayOffset: number | null
  nominationClosingLocalTime: string | null
  opinionOpeningDayOffset: number | null
  opinionOpeningLocalTime: string | null
  opinionClosingDayOffset: number | null
  opinionClosingLocalTime: string | null
}
export interface AutomationConfiguration {
  isEnabled: boolean
  calendar: AutomationCalendar | null
  version: string
  updatedAtUtc: string | null
  updatedByUserId: string | null
}
export interface AutomationState {
  configuration: AutomationConfiguration
  technicalEnabled: boolean
  effectiveEnabled: boolean
  legacyScheduleDetected: boolean
  timeZone: string
  firstEvaluationMonth: string | null
  operationalStatus: {
    lastCheckAtUtc: string | null
    lastGenerationAtUtc: string | null
    lastGeneratedMonth: string | null
    error: string | null
  }
  statusScope: string
}
export interface AutomationUpdateRequest {
  isEnabled: boolean
  calendar: AutomationCalendar | null
  version: string | null
}
export interface AutomationPreviewRequest {
  calendar: AutomationCalendar | null
  upcomingMonths: number
}
export interface AutomationPreview {
  timeZone: string
  months: {
    evaluationMonth: string
    dates: {
      nominationOpening: string
      nominationClosing: string
      opinionOpening: string
      opinionClosing: string
    }
    alreadyExists: boolean
    existingCampaignId: string | null
    isArchived: boolean
    isPending: boolean
    conflicts: string[]
    existingCampaign: Campaign | null
  }[]
  pendingMonths: string[]
}
