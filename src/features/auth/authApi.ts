import { request } from '@/shared/api/httpClient'
export type Tokens = { accessToken: string; refreshToken: string; expiresIn: number }
export type User = {
  userId: string
  userName: string
  displayName: string | null
  roles: string[]
  mustChangePassword: boolean
}
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
