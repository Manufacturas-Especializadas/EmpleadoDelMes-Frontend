import { request } from '@/shared/api/httpClient'
import type {
  EmployeeImportPreview,
  EmployeeImportResult,
  SponsorImportPreview,
  SponsorImportResult,
} from './types'
async function send<T>(path: `/${string}`, file: File, signal: AbortSignal, confirmed = false) {
  const body = new FormData()
  body.append('File', file)
  if (confirmed) body.append('Confirm', 'true')
  return (await request<T>(path, { method: 'POST', body, authenticated: true, signal })).data
}
export const employeeImports = {
  preview: (file: File, signal: AbortSignal) =>
    send<EmployeeImportPreview>('/api/employees/import/preview', file, signal),
  confirm: (file: File, signal: AbortSignal) =>
    send<EmployeeImportResult>('/api/employees/import/confirm', file, signal),
}
export const sponsorImports = {
  preview: (file: File, signal: AbortSignal) =>
    send<SponsorImportPreview>('/api/users/import/sponsors/preview', file, signal),
  confirm: (file: File, signal: AbortSignal) =>
    send<SponsorImportResult>('/api/users/import/sponsors/confirm', file, signal, true),
}
