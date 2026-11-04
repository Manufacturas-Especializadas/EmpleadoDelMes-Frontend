import type { Campaign } from '@/features/campaigns'
import type { Candidate, NominationConfirmation } from '@/features/nominations'
import type { Preselection, NominationCandidate } from '@/features/preselections'
import type { Opinion, OpinionCandidate } from '@/features/opinions'
import type { ReviewCandidate, ReviewDetail } from '@/features/review'
import type { PaginatedResponse } from '@/shared/api/types'
import type { Employee } from '@/features/employees'
import { createAdministration } from './administration'

const campaignId = '10000000-0000-4000-8000-000000000001'
const now = () => new Date().toISOString()
let sequence = 1
const version = () => btoa(String(sequence++).padStart(8, '0'))
const campaign: Campaign = {
  id: campaignId,
  evaluationMonth: '2026-11-01',
  createdAtUtc: now(),
  isArchived: false,
  nominationPeriod: { mode: 1, scheduledOpeningAtUtc: null, scheduledClosingAtUtc: null },
  opinionPeriod: { mode: 1, scheduledOpeningAtUtc: null, scheduledClosingAtUtc: null },
  version: version(),
  canAcceptNominations: true,
  canAcceptOpinions: true,
}
const employees: Employee[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    payrollNumber: 'DEMO001',
    fullName: 'Alex Ejemplo',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    payrollNumber: 'DEMO002',
    fullName: 'María Demostración',
  },
  { id: '20000000-0000-4000-8000-000000000003', payrollNumber: 'DEMO003', fullName: 'Luis Prueba' },
].map((item) => ({ ...item, version: version() }))
const sponsor: Candidate = {
  id: '20000000-0000-4000-8000-000000000099',
  payrollNumber: 'DEMO099',
  fullName: 'Patrocinador de ejemplo',
}
const nominations: NominationConfirmation[] = []
employees.push({ ...sponsor, version: version() })
const administration = createAdministration({
  employees,
  nominations,
  campaign,
  version,
  fail,
  page,
})
const selections = new Map<string, Preselection>()
const opinions = new Map<string, Opinion>()
const roles = ['Administrator', 'Sponsor', 'HumanResources', 'Safety', 'Quality']
const sessions = new Map<string, string>()
class DemoFailure extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
function fail(status: number, message: string): never {
  throw new DemoFailure(status, message)
}
function matchVersion(received: unknown, expected: string | null) {
  if (received !== expected)
    fail(409, 'La información cambió. Consulta su versión actual antes de guardar.')
}
function updatePeriods() {
  const open = (period: Campaign['nominationPeriod']) =>
    !campaign.isArchived &&
    (period.mode === 1 ||
      (period.mode === 0 &&
        !!period.scheduledOpeningAtUtc &&
        !!period.scheduledClosingAtUtc &&
        Date.now() >= Date.parse(period.scheduledOpeningAtUtc) &&
        Date.now() < Date.parse(period.scheduledClosingAtUtc)))
  campaign.canAcceptNominations = open(campaign.nominationPeriod)
  campaign.canAcceptOpinions = open(campaign.opinionPeriod)
}
function page<T>(items: T[], url: URL): PaginatedResponse<T> {
  const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1),
    pageSize = Number(url.searchParams.get('pageSize') ?? 20)
  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  )
    fail(400, 'Paginación no válida.')
  return {
    items: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    total: items.length,
    pageNumber,
    pageSize,
  }
}
function findEmployee(id: string) {
  return employees.find((item) => item.id === id) ?? fail(404, 'No encontramos al candidato.')
}
function checkCampaign(id: string | null) {
  if (id !== campaignId) fail(id ? 404 : 400, 'Selecciona la convocatoria de demostración.')
}
function count(id: string) {
  return nominations.filter((item) => item.candidate.id === id && !item.isCancelled).length
}
function eligible(id: string) {
  return selections.get(id)?.isSelected && count(id) > 0
}
function text(body: Record<string, unknown>, key: string) {
  const value = body[key]
  return typeof value === 'string' ? value : ''
}
function content(body: Record<string, unknown>, key: string) {
  const value = text(body, key).trim()
  if (!value || value.length > 500) fail(400, 'Escribe un texto de entre 1 y 500 caracteres.')
  return value
}
function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
function handle(
  url: URL,
  method: string,
  body: Record<string, unknown>,
  token: string,
  form?: FormData,
) {
  const path = url.pathname
  if (path === '/api/auth/login' && method === 'POST') {
    const role = text(body, 'userName')
    if (!roles.includes(role)) fail(401, 'Selecciona uno de los perfiles de demostración.')
    if (role === 'Sponsor' && !administration.sponsorActive())
      fail(401, 'El patrocinador de demostración está desactivado.')
    const accessToken = crypto.randomUUID()
    sessions.set(accessToken, role)
    return response({ accessToken, refreshToken: accessToken, expiresIn: 900 })
  }
  if (path === '/api/auth/refresh' && method === 'POST') {
    const previous = text(body, 'refreshToken')
    const refreshRole = sessions.get(previous)
    if (!refreshRole || (refreshRole === 'Sponsor' && !administration.sponsorActive()))
      fail(401, 'La sesión de demostración venció.')
    const accessToken = crypto.randomUUID()
    sessions.set(accessToken, refreshRole)
    sessions.delete(previous)
    return response({ accessToken, refreshToken: accessToken, expiresIn: 900 })
  }
  const role = sessions.get(token)
  if (!role) fail(401, 'Inicia sesión en la demostración.')
  if (role === 'Sponsor' && !administration.sponsorActive())
    fail(401, 'La cuenta está desactivada.')
  const userId = '30000000-0000-4000-8000-' + String(roles.indexOf(role) + 1).padStart(12, '0')
  const requireRole = (allowed: string[]) => {
    if (!allowed.includes(role)) fail(403, 'No tienes permiso para realizar esta operación.')
  }
  if (path === '/api/auth/me')
    return response({
      userId,
      userName: role,
      displayName: 'Perfil de demostración',
      roles: [role],
      mustChangePassword: false,
    })
  if (path === '/api/auth/change-password')
    return response({ message: 'Contraseña de demostración actualizada.' })
  updatePeriods()
  const administrativeResponse = administration.handle(url, method, body, role, form)
  if (administrativeResponse) return administrativeResponse
  const term = (url.searchParams.get('term') ?? '').trim().toLocaleLowerCase()
  if (term.length > 100) fail(400, 'La búsqueda no puede superar 100 caracteres.')
  const matches = (name: string, payroll: string) =>
    !term || (name + ' ' + payroll).toLocaleLowerCase().includes(term)
  if (path.startsWith('/api/campaigns')) {
    requireRole(['Administrator'])
    if (path === '/api/campaigns' && method === 'GET') return response(page([campaign], url))
    const parts = path.split('/').filter(Boolean)
    checkCampaign(parts[2])
    if (parts.length === 3 && method === 'GET') return response(campaign)
    matchVersion(body.version, campaign.version)
    if (parts[3] === 'archive') {
      campaign.isArchived = true
      campaign.nominationPeriod.mode = 2
      campaign.opinionPeriod.mode = 2
    } else if (parts[3] === 'reopen') {
      if (campaign.isArchived) {
        campaign.isArchived = false
        campaign.nominationPeriod.mode = 2
        campaign.opinionPeriod.mode = 2
      }
    } else {
      const period =
        parts[3] === 'nominations'
          ? campaign.nominationPeriod
          : parts[3] === 'opinions'
            ? campaign.opinionPeriod
            : fail(404, 'Periodo desconocido.')
      if (campaign.isArchived && parts[4] !== 'close')
        fail(400, 'Una convocatoria archivada no permite habilitar capturas.')
      if (parts[4] === 'schedule') {
        const openingAt = text(body, 'openingAt'),
          closingAt = text(body, 'closingAt')
        if (
          !/(Z|[+-]\d{2}:\d{2})$/.test(openingAt) ||
          !/(Z|[+-]\d{2}:\d{2})$/.test(closingAt) ||
          !Number.isFinite(Date.parse(openingAt)) ||
          !Number.isFinite(Date.parse(closingAt)) ||
          Date.parse(openingAt) >= Date.parse(closingAt)
        )
          fail(400, 'El cierre debe ser posterior a la apertura; incluye zona horaria.')
        period.scheduledOpeningAtUtc = openingAt
        period.scheduledClosingAtUtc = closingAt
      } else if (parts[4] === 'open') period.mode = 1
      else if (parts[4] === 'close') period.mode = 2
      else if (parts[4] === 'automatic') {
        if (!period.scheduledOpeningAtUtc)
          fail(400, 'Configura el horario antes de habilitar el modo automático.')
        period.mode = 0
      } else fail(404, 'Acción desconocida.')
    }
    campaign.version = version()
    updatePeriods()
    return response(campaign)
  }
  if (path.startsWith('/api/nominations')) {
    requireRole(['Sponsor'])
    if (path.endsWith('/active-campaign')) {
      if (!campaign.canAcceptNominations)
        fail(409, 'No hay una convocatoria que acepte postulaciones en este momento.')
      return response({ id: campaignId, evaluationMonth: campaign.evaluationMonth })
    }
    if (path.endsWith('/candidates')) {
      if (!term) fail(400, 'Escribe un nombre o una nómina.')
      return response(
        page(
          employees.filter((item) => matches(item.fullName, item.payrollNumber)),
          url,
        ),
      )
    }
    if (path === '/api/nominations' && method === 'POST') {
      if (!campaign.canAcceptNominations) fail(409, 'La convocatoria ya no acepta postulaciones.')
      const candidate = findEmployee(text(body, 'candidateEmployeeId'))
      if (candidate.id === sponsor.id) fail(400, 'No puedes postularte a ti mismo.')
      if (nominations.some((item) => item.candidate.id === candidate.id))
        fail(409, 'Ya postulaste a este empleado en esta convocatoria.')
      const flags = body.qualities
      if (typeof flags !== 'number' || !Number.isInteger(flags) || flags < 1 || flags > 15)
        fail(400, 'Selecciona al menos una cualidad.')
      const nomination: NominationConfirmation = {
        id: crypto.randomUUID(),
        campaignId,
        createdByUserId: userId,
        sponsor: { ...sponsor },
        candidate: { ...candidate },
        qualities: flags,
        justification: content(body, 'justification'),
        registeredAtUtc: now(),
        isCancelled: false,
      }
      nominations.push(nomination)
      return response(nomination, 201)
    }
  }
  if (path === '/api/admin/nominations/candidates') {
    requireRole(['Administrator'])
    checkCampaign(url.searchParams.get('campaignId'))
    const items: NominationCandidate[] = employees
      .filter((item) => count(item.id) > 0 && matches(item.fullName, item.payrollNumber))
      .map((item) => ({
        campaignId,
        candidateEmployeeId: item.id,
        candidatePayrollNumber: item.payrollNumber,
        candidateFullName: item.fullName,
        validNominationsCount: count(item.id),
        isPreselected: selections.get(item.id)?.isSelected ?? false,
        preselectionVersion: selections.get(item.id)?.version ?? null,
      }))
    return response(page(items, url))
  }
  if (path.startsWith('/api/admin/preselections/')) {
    requireRole(['Administrator'])
    const parts = path.split('/').filter(Boolean)
    checkCampaign(parts[3])
    const id = parts[4]
    findEmployee(id)
    if (campaign.isArchived) fail(409, 'No se puede modificar una convocatoria archivada.')
    const existing = selections.get(id)
    matchVersion(body.version, existing?.version ?? null)
    const selected = parts[5] === 'select'
    if (selected && !count(id)) fail(409, 'El candidato necesita una postulación válida.')
    if (!selected && !existing) fail(404, 'No encontramos la preselección.')
    const result: Preselection = {
      campaignId,
      candidateEmployeeId: id,
      isSelected: selected,
      lastChangedByUserId: userId,
      lastChangedAtUtc: now(),
      version: version(),
    }
    selections.set(id, result)
    return response(result)
  }
  if (path.startsWith('/api/opinions/')) {
    requireRole(['HumanResources', 'Safety', 'Quality'])
    if (path === '/api/opinions/campaigns') return response(page([campaign], url))
    if (path === '/api/opinions/candidates') {
      checkCampaign(url.searchParams.get('campaignId'))
      const items: OpinionCandidate[] = employees
        .filter(
          (item) =>
            !campaign.isArchived && eligible(item.id) && matches(item.fullName, item.payrollNumber),
        )
        .map((item) => ({
          campaignId,
          candidateEmployeeId: item.id,
          candidatePayrollNumber: item.payrollNumber,
          candidateFullName: item.fullName,
          hasOpinion: opinions.has(role + item.id),
        }))
      return response(page(items, url))
    }
    const parts = path.split('/').filter(Boolean)
    checkCampaign(parts[2])
    const id = parts[3]
    findEmployee(id)
    const key = role + id,
      existing = opinions.get(key)
    if (method === 'GET')
      return response({
        hasOpinion: !!existing,
        opinion: existing ?? null,
        message: existing ? null : 'La opinión de tu departamento está pendiente.',
      })
    if (method === 'PUT') {
      matchVersion(body.version, existing?.version ?? null)
      if (!campaign.canAcceptOpinions)
        fail(409, 'La convocatoria no admite opiniones en este momento.')
      if (!eligible(id))
        fail(409, 'El candidato debe estar preseleccionado y conservar una postulación válida.')
      const result: Opinion = {
        id: existing?.id ?? crypto.randomUUID(),
        campaignId,
        candidateEmployeeId: id,
        content: content(body, 'content'),
        createdAtUtc: existing?.createdAtUtc ?? now(),
        lastModifiedAtUtc: now(),
        version: version(),
      }
      opinions.set(key, result)
      return response(result, existing ? 200 : 201)
    }
  }
  if (path.startsWith('/api/admin/candidates/')) {
    requireRole(['Administrator'])
    if (path === '/api/admin/candidates/review') {
      checkCampaign(url.searchParams.get('campaignId'))
      const items: ReviewCandidate[] = employees
        .filter((item) => eligible(item.id) && matches(item.fullName, item.payrollNumber))
        .map((item) => ({
          campaignId,
          candidateEmployeeId: item.id,
          candidatePayrollNumber: item.payrollNumber,
          candidateFullName: item.fullName,
          validNominationsCount: count(item.id),
          humanResourcesHasOpinion: opinions.has('HumanResources' + item.id),
          safetyHasOpinion: opinions.has('Safety' + item.id),
          qualityHasOpinion: opinions.has('Quality' + item.id),
        }))
      return response(page(items, url))
    }
    const parts = path.split('/').filter(Boolean)
    checkCampaign(parts[3])
    const candidate = findEmployee(parts[4])
    if (!eligible(candidate.id))
      fail(404, 'No encontramos un candidato elegible para esta revisión.')
    const detail: ReviewDetail = {
      campaignId,
      evaluationMonth: campaign.evaluationMonth,
      candidateEmployeeId: candidate.id,
      candidatePayrollNumber: candidate.payrollNumber,
      candidateFullName: candidate.fullName,
      isPreselected: true,
      validNominationsCount: count(candidate.id),
      nominations: nominations
        .filter((item) => item.candidate.id === candidate.id && !item.isCancelled)
        .map((item) => ({
          id: item.id,
          sponsorPayrollNumber: item.sponsor.payrollNumber,
          sponsorFullName: item.sponsor.fullName,
          qualities: item.qualities,
          justification: item.justification,
          registeredAtUtc: item.registeredAtUtc,
        })),
      opinions: ([1, 2, 3] as const).map((source) => {
        const opinion = opinions.get(
          { 1: 'HumanResources', 2: 'Safety', 3: 'Quality' }[source] + candidate.id,
        )
        return {
          opinionSource: source,
          hasOpinion: !!opinion,
          content: opinion?.content ?? null,
          createdAtUtc: opinion?.createdAtUtc ?? null,
          lastModifiedAtUtc: opinion?.lastModifiedAtUtc ?? null,
        }
      }),
    }
    return response(detail)
  }
  return fail(404, 'Ruta no incluida en la demostración.')
}
export const demoFetch: typeof fetch = async (input, init) => {
  if (!import.meta.env.DEV) throw new Error('Demostración no disponible en producción.')
  init?.signal?.throwIfAborted()
  const url = new URL(
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
    location.origin,
  )
  const headers = new Headers(init?.headers)
  try {
    const body: Record<string, unknown> =
      typeof init?.body === 'string' ? JSON.parse(init.body) : {}
    return handle(
      url,
      init?.method ?? 'GET',
      body,
      (headers.get('Authorization') ?? '').replace(/^Bearer /, ''),
      init?.body instanceof FormData ? init.body : undefined,
    )
  } catch (error) {
    if (error instanceof DemoFailure) return response({ message: error.message }, error.status)
    throw error
  }
}
