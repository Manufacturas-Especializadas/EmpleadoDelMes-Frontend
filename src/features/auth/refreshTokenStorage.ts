// Only the refresh token is stored. Demo credentials never share storage with a real session.
const key = 'empleadodelmes.refreshToken'
const demo =
  import.meta.env.DEV &&
  (import.meta.env.VITE_DEMO === 'true' || import.meta.env.VITE_DEMO_CAMPAIGNS === 'true')

export function readRefreshToken(): string | null {
  if (demo) return null
  try {
    return window.sessionStorage.getItem(key) || null
  } catch {
    // Storage may be unavailable; ordinary in-memory login remains usable.
    return null
  }
}
export function storeRefreshToken(token: string | null) {
  if (demo) return
  try {
    if (token) window.sessionStorage.setItem(key, token)
    else window.sessionStorage.removeItem(key)
  } catch {
    // Do not expose tokens or fail an otherwise valid login when storage is blocked.
  }
}
