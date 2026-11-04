import { useSyncExternalStore } from 'react'
import { authApi } from './authApi'
import type { Tokens, User } from './types'
let user: User | null = null
let tokens: Tokens | null = null
let generation = 0
const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((listener) => listener())
}
export function logout() {
  generation++
  tokens = null
  user = null
  emit()
}
export async function login(userName: string, password: string) {
  logout()
  const version = generation
  const response = await authApi.login(userName, password)
  const profile = await authApi.me(response.data.accessToken)
  if (version !== generation) return
  tokens = response.data
  user = {
    ...profile.data,
    mustChangePassword:
      profile.data.mustChangePassword || response.headers.get('X-Must-Change-Password') === 'true',
  }
  emit()
}
export async function changePassword(current: string, next: string) {
  if (!tokens) throw new Error('Inicia sesión nuevamente.')
  await authApi.changePassword(tokens.accessToken, current, next)
  logout()
}
export function useAuth() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => user,
  )
}

export const roles = [
  { name: 'Administrator', path: '/admin', label: 'Administración' },
  { name: 'Sponsor', path: '/sponsor', label: 'Patrocinador' },
  { name: 'HumanResources', path: '/human-resources', label: 'Recursos Humanos' },
  { name: 'Safety', path: '/safety', label: 'Seguridad' },
  { name: 'Quality', path: '/quality', label: 'Calidad' },
]

export function home(user: User) {
  return user.mustChangePassword
    ? '/change-password'
    : (roles.find((role) => user.roles.includes(role.name))?.path ?? '/access-denied')
}

export function getAccessToken(): string | null {
  return tokens?.accessToken ?? null
}
