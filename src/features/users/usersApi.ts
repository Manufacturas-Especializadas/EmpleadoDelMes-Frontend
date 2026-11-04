import { request } from '@/shared/api/httpClient'
import type { PaginatedResponse } from '@/shared/api/types'
import { queryString } from '@/shared/utils/queryString'
import type { Account, AccountListItem, CreatedAccount, DepartmentRole } from './types'
export const usersApi = {
  list: async (term: string, role: string, pageNumber: number, signal: AbortSignal) => {
    const params = new URLSearchParams(queryString({ term, pageNumber }))
    if (role) params.set('role', role)
    return (
      await request<PaginatedResponse<AccountListItem>>(`/api/users?${params}`, {
        authenticated: true,
        signal,
      })
    ).data
  },
  get: async (id: string, signal: AbortSignal) =>
    (await request<Account>(`/api/users/${id}`, { authenticated: true, signal })).data,
  sponsor: async (employeeId: string, signal: AbortSignal) =>
    (
      await request<CreatedAccount>('/api/users/sponsors', {
        method: 'POST',
        body: { employeeId },
        authenticated: true,
        signal,
      })
    ).data,
  department: async (role: DepartmentRole, signal: AbortSignal) =>
    (
      await request<CreatedAccount>('/api/users/departments', {
        method: 'POST',
        body: { role },
        authenticated: true,
        signal,
      })
    ).data,
  status: async (id: string, isActive: boolean, signal: AbortSignal) =>
    (
      await request<Account>(`/api/users/${id}/status`, {
        method: 'PATCH',
        body: { isActive },
        authenticated: true,
        signal,
      })
    ).data,
}
