import { getJson } from '@/shared/api/httpClient'

export interface PingResponse {
  status: string
  message: string
}

export function getPing(signal?: AbortSignal): Promise<PingResponse> {
  return getJson<PingResponse>('/api/ping', signal)
}
