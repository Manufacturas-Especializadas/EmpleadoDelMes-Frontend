import { request } from '@/shared/api/httpClient'
import type { PaginatedResponse } from '@/shared/api/types'
import { queryString } from '@/shared/utils/queryString'
import type { Employee } from './types'
export const employeesApi = {
  list: async (term: string, pageNumber: number, signal: AbortSignal) =>
    (
      await request<PaginatedResponse<Employee>>(
        `/api/employees?${queryString({ term, pageNumber })}`,
        { authenticated: true, signal },
      )
    ).data,
  get: async (id: string, signal: AbortSignal) =>
    (
      await request<Employee>(`/api/employees/${encodeURIComponent(id)}`, {
        authenticated: true,
        signal,
      })
    ).data,
  byPayroll: async (payroll: string, signal: AbortSignal) =>
    (
      await request<Employee>(`/api/employees/by-payroll/${encodeURIComponent(payroll)}`, {
        authenticated: true,
        signal,
      })
    ).data,
  create: async (payrollNumber: string, fullName: string, signal: AbortSignal) =>
    (
      await request<Employee>('/api/employees', {
        method: 'POST',
        body: { payrollNumber, fullName },
        authenticated: true,
        signal,
      })
    ).data,
  rename: async (id: string, fullName: string, version: string, signal: AbortSignal) =>
    (
      await request<Employee>(`/api/employees/${encodeURIComponent(id)}/name`, {
        method: 'PUT',
        body: { fullName, version },
        authenticated: true,
        signal,
      })
    ).data,
}
