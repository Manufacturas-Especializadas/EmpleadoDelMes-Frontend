import { ApiError, request } from '@/shared/api/httpClient'
import type {
  AutomationState,
  AutomationPreview,
  AutomationPreviewRequest,
  AutomationUpdateRequest,
} from './types'
const path = '/api/admin/campaign-automation' as const
export const automationDemo =
  import.meta.env.DEV &&
  (import.meta.env.VITE_DEMO === 'true' || import.meta.env.VITE_DEMO_CAMPAIGNS === 'true')
function requireRealMode() {
  if (automationDemo) throw new ApiError(0, 'La automatización no está disponible en demostración.')
}
export async function getAutomation(signal: AbortSignal) {
  requireRealMode()
  return (await request<AutomationState>(path, { authenticated: true, signal })).data
}
export async function saveAutomation(body: AutomationUpdateRequest, signal: AbortSignal) {
  requireRealMode()
  return (
    await request<AutomationState>(path, { method: 'PUT', body, authenticated: true, signal })
  ).data
}
export async function previewAutomation(body: AutomationPreviewRequest, signal: AbortSignal) {
  requireRealMode()
  return (
    await request<AutomationPreview>(`${path}/preview`, {
      method: 'POST',
      body,
      authenticated: true,
      signal,
    })
  ).data
}
