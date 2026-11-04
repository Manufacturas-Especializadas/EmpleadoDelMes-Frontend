import { request } from '@/shared/api/httpClient'
import type { Tokens, User } from './types'
export const authApi = {
  login: (userName: string, password: string) =>
    request<Tokens>('/api/auth/login', { method: 'POST', body: { userName, password } }),
  me: (token: string) => request<User>('/api/auth/me', { token }),
  refresh: (refreshToken: string) =>
    request<Tokens>('/api/auth/refresh', { method: 'POST', body: { refreshToken } }),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      token,
      body: { currentPassword, newPassword },
    }),
}
