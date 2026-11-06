import { request } from '@/shared/api/httpClient'
import type { PaginatedResponse } from '@/shared/api/types'
import { queryString } from '@/shared/utils/queryString'
export interface AssignmentEmployee {
  id: string
  payrollNumber: string
  fullName: string
}
export interface Assignment {
  id: string
  sponsorEmployeeId: string
  employeeId: string
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string
  version: string
}
const base = '/api/admin/sponsor-assignments'
export const assignmentsApi = {
  list: async (path: string, term: string, pageNumber: number, signal: AbortSignal) =>
    (
      await request<PaginatedResponse<AssignmentEmployee>>(
        `${base}/${path}${path.includes('?') ? '&' : '?'}${queryString({ term, pageNumber })}`,
        { authenticated: true, signal },
      )
    ).data,
  current: async (id: string, signal: AbortSignal) =>
    (
      await request<{ assignment: Assignment | null }>(`${base}/employees/${id}/current`, {
        authenticated: true,
        signal,
      })
    ).data,
  change: async (
    id: string,
    action: 'assign' | 'reassign' | 'withdraw',
    body: { sponsorEmployeeId?: string; version?: string },
    signal: AbortSignal,
  ) =>
    (
      await request<Assignment>(`${base}/employees/${id}/${action}`, {
        method: action === 'reassign' ? 'PUT' : 'POST',
        body,
        authenticated: true,
        signal,
      })
    ).data,
}
export const assignmentDemo =
  import.meta.env.DEV &&
  (import.meta.env.VITE_DEMO === 'true' || import.meta.env.VITE_DEMO_CAMPAIGNS === 'true')
