import { getAccessToken, logout } from '@/features/auth'
import { configureHttpSession } from '@/shared/api/httpClient'

configureHttpSession({
  getToken: getAccessToken,
  onUnauthorized: (token) => {
    // Una respuesta tardía de una sesión anterior no debe cerrar una sesión nueva.
    if (token === getAccessToken()) logout()
  },
})
