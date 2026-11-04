import {
  getAccessToken,
  getSessionVersion,
  prepareAccessToken,
  refreshSession,
  logout,
} from '@/features/auth/session'
import { configureHttpSession } from '@/shared/api/httpClient'
configureHttpSession({
  getToken: getAccessToken,
  getVersion: getSessionVersion,
  prepare: prepareAccessToken,
  refresh: refreshSession,
  onUnauthorized: (token) => {
    if (token === getAccessToken()) logout()
  },
})
