import { expect, it, vi, afterEach } from 'vitest'
import { campaignMonth, defaultCampaign, sortCampaigns, canWriteOpinion } from './campaignSelection'
import { opinionsApi } from './opinionsApi'
import { request } from '@/shared/api/httpClient'
vi.mock('@/shared/api/httpClient', () => ({ request: vi.fn() }))
afterEach(() => vi.resetAllMocks())
const closed = {
  id: 'closed',
  evaluationMonth: '2026-11-01',
  canAcceptOpinions: false,
  isArchived: false,
}
const open = { ...closed, id: 'open', evaluationMonth: '2026-10-01', canAcceptOpinions: true }
const archived = { ...open, id: 'archived', isArchived: true }
it('muestra el mes español sin desplazamientos de zona horaria', () => {
  expect(campaignMonth(open.evaluationMonth)).toBe('Octubre de 2026')
})
it('prioriza abiertas no archivadas y permite históricas autorizadas', () => {
  const items = sortCampaigns([archived, open, closed])
  expect(defaultCampaign(items)).toBe(open)
  expect(defaultCampaign(items, 'archived')).toBe(archived)
  expect(defaultCampaign(items, 'unknown')).toBe(open)
  expect(defaultCampaign([closed, archived])).toBe(closed)
  expect(defaultCampaign([archived])).toBe(archived)
  expect(defaultCampaign([])).toBeUndefined()
})
it('impide escribir en cerradas o archivadas', () => {
  expect(canWriteOpinion(open)).toBe(true)
  expect(canWriteOpinion(closed)).toBe(false)
  expect(canWriteOpinion(archived)).toBe(false)
})
it('recorre todas las páginas para ofrecer históricos', async () => {
  vi.mocked(request)
    .mockResolvedValueOnce({
      data: { items: [open], pageNumber: 1, pageSize: 1, total: 2 },
      headers: new Headers(),
    })
    .mockResolvedValueOnce({
      data: { items: [archived], pageNumber: 2, pageSize: 1, total: 2 },
      headers: new Headers(),
    })
  expect(await opinionsApi.campaigns(new AbortController().signal)).toEqual([open, archived])
  expect(request).toHaveBeenCalledTimes(2)
  expect(vi.mocked(request).mock.calls[1][0]).toContain('pageNumber=2')
})
it('propaga errores HTTP y respeta cancelación', async () => {
  vi.mocked(request).mockRejectedValueOnce(new Error('Sin permisos'))
  await expect(opinionsApi.campaigns(new AbortController().signal)).rejects.toThrow('Sin permisos')
  const controller = new AbortController()
  controller.abort()
  await expect(opinionsApi.campaigns(controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  })
  expect(request).toHaveBeenCalledTimes(1)
})
it('acepta respuesta vacía', async () => {
  vi.mocked(request).mockResolvedValueOnce({
    data: { items: [], pageNumber: 1, pageSize: 20, total: 0 },
    headers: new Headers(),
  })
  expect(await opinionsApi.campaigns(new AbortController().signal)).toEqual([])
})
