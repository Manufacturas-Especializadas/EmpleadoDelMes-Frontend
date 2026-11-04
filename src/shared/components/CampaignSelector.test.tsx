import { beforeEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CampaignSelector } from './CampaignSelector'
import { canLoadCampaigns, selectCampaignId, loadCampaignOptions } from '../api/campaignOptions'
import { getCampaigns } from '@/features/campaigns/campaignsApi'
import { opinionsApi } from '@/features/opinions/opinionsApi'
const state = vi.hoisted(() => ({
  roles: ['Administrator'],
  params: new URLSearchParams(),
  query: {
    data: [] as {
      id: string
      evaluationMonth: string
      isArchived: boolean
      canAcceptOpinions: boolean
    }[],
    loading: false,
    error: undefined as string | undefined,
    reload: vi.fn(),
  },
}))
vi.mock('@/features/auth', () => ({ useAuth: () => ({ userId: 'u', roles: state.roles }) }))
vi.mock('react-router', () => ({ useSearchParams: () => [state.params, vi.fn()] }))
vi.mock('@/shared/hooks/useQuery', () => ({ useQuery: () => state.query }))
vi.mock('@/features/campaigns/campaignsApi', () => ({ getCampaigns: vi.fn() }))
vi.mock('@/features/opinions/opinionsApi', () => ({ opinionsApi: { campaigns: vi.fn() } }))
const old = { id: 'old', evaluationMonth: '2025-10-01', isArchived: true, canAcceptOpinions: false }
const recent = { ...old, id: 'recent', evaluationMonth: '2026-10-01', isArchived: false }
beforeEach(() => {
  vi.clearAllMocks()
  state.roles = ['Administrator']
  state.params = new URLSearchParams()
  state.query = { ...state.query, data: [old, recent], loading: false, error: undefined }
})
const markup = () =>
  renderToStaticMarkup(<CampaignSelector>{(id) => <p>Contenido {id}</p>}</CampaignSelector>)
it('elige la más reciente no archivada y respeta enlaces de detalle', () => {
  expect(selectCampaignId([old, recent], null)).toBe('recent')
  state.params.set('campaignId', old.id)
  expect(markup()).toContain('Contenido old')
  expect(markup()).toContain('Archivada')
})
it('informa identificador inexistente sin mostrarlo', () => {
  state.params.set('campaignId', 'missing-guid')
  expect(markup()).toContain('no está disponible')
  expect(markup()).not.toContain('missing-guid')
  expect(markup()).toContain('Contenido recent')
})
it('cambia la clave de contenido para reiniciar página, filtros y modales', () => {
  const first = CampaignSelector({ children: (id) => <p>{id}</p> })
  state.params.set('campaignId', 'old')
  const second = CampaignSelector({ children: (id) => <p>{id}</p> })
  expect(first.props.children[2].key).toBe('recent')
  expect(second.props.children[2].key).toBe('old')
})
it('permite todas las convocatorias', () => {
  expect(selectCampaignId([recent], 'all', true)).toBe('')
})
it('muestra carga, error y vacío sin operaciones', () => {
  state.query.loading = true
  expect(markup()).toContain('Cargando')
  state.query.loading = false
  state.query.error = 'No autorizado'
  expect(markup()).toContain('No autorizado')
  state.query.error = undefined
  state.query.data = []
  expect(markup()).toContain('No hay convocatorias')
  expect(markup()).not.toContain('Contenido')
})
it('separa los permisos departamentales de administración', () => {
  for (const role of ['HumanResources', 'Safety', 'Quality']) {
    expect(canLoadCampaigns('admin', [role])).toBe(false)
    expect(canLoadCampaigns('opinions', [role])).toBe(true)
  }
  expect(canLoadCampaigns('opinions', ['Sponsor'])).toBe(false)
  state.roles = ['Safety']
  expect(markup()).toContain('No tienes permiso')
})
it('carga todas las páginas administrativas y usa solo el endpoint departamental para opiniones', async () => {
  vi.mocked(getCampaigns)
    .mockResolvedValueOnce({ items: [recent], pageNumber: 1, pageSize: 1, total: 2 } as never)
    .mockResolvedValueOnce({ items: [old], pageNumber: 2, pageSize: 1, total: 2 } as never)
  const signal = new AbortController().signal
  expect(await loadCampaignOptions('admin', signal)).toEqual([recent, old])
  expect(getCampaigns).toHaveBeenCalledTimes(2)
  vi.mocked(opinionsApi.campaigns).mockResolvedValue([recent])
  await loadCampaignOptions('opinions', signal)
  expect(getCampaigns).toHaveBeenCalledTimes(2)
  expect(opinionsApi.campaigns).toHaveBeenCalledWith(signal)
})
