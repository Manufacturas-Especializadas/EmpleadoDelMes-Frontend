import type { Employee } from '@/features/employees'
import type { Account, AccountListItem } from '@/features/users'
import type { NominationConfirmation } from '@/features/nominations'
import type { AdminNominationDetail } from '@/features/adminNominations'
import type { Campaign } from '@/features/campaigns'
import type {
  EmployeeImportPreview,
  SponsorImportPreview,
  SponsorImportRow,
} from '@/features/imports'
import type { PaginatedResponse } from '@/shared/api/types'
type Context = {
  employees: Employee[]
  nominations: NominationConfirmation[]
  campaign: Campaign
  version: () => string
  fail: (status: number, message: string) => never
  page: <T>(items: T[], url: URL) => PaginatedResponse<T>
}
export function createAdministration(context: Context) {
  const { employees, nominations, campaign, version, page } = context
  function fail(status: number, message: string): never {
    return context.fail(status, message)
  }
  const accounts: Account[] = [
    {
      id: '30000000-0000-4000-8000-000000000001',
      userName: 'admin-demo',
      employeeId: null,
      roles: ['Administrator'],
      mustChangePassword: false,
      isActive: true,
    },
    {
      id: '30000000-0000-4000-8000-000000000002',
      userName: 'DEMO099',
      employeeId: '20000000-0000-4000-8000-000000000099',
      roles: ['Sponsor'],
      mustChangePassword: false,
      isActive: true,
    },
  ]
  const nominationVersions = new Map<string, string>()
  const result = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  const text = (body: Record<string, unknown>, key: string) =>
    typeof body[key] === 'string' ? (body[key] as string) : ''
  const required = (value: string, max: number) => {
    const clean = value.trim()
    if (!clean || clean.length > max) fail(400, `Escribe un valor de entre 1 y ${max} caracteres.`)
    return clean
  }
  const employee = (id: string) =>
    employees.find((item) => item.id === id) ?? fail(404, 'No encontramos al empleado.')
  const match = (received: unknown, expected: string) => {
    if (received !== expected)
      fail(409, 'La información cambió. Consulta la versión actual sin borrar tu formulario.')
  }
  const addEmployee = (payroll: string, name: string) => {
    const payrollNumber = required(payroll, 32),
      fullName = required(name, 200)
    if (employees.some((item) => item.payrollNumber.toLowerCase() === payrollNumber.toLowerCase()))
      fail(409, 'Ya existe esa nómina.')
    const value: Employee = { id: crypto.randomUUID(), payrollNumber, fullName, version: version() }
    employees.push(value)
    return value
  }
  const addSponsor = (id: string) => {
    const item = employee(id)
    if (
      accounts.some(
        (account) =>
          account.employeeId === id ||
          account.userName.toLowerCase() === item.payrollNumber.toLowerCase(),
      )
    )
      fail(409, 'Ya existe una cuenta o un conflicto para este empleado.')
    const account: Account = {
      id: crypto.randomUUID(),
      userName: item.payrollNumber,
      employeeId: id,
      roles: ['Sponsor'],
      isActive: true,
      mustChangePassword: true,
    }
    accounts.push(account)
    return account
  }
  function detail(nomination: NominationConfirmation): AdminNominationDetail {
    let current = nominationVersions.get(nomination.id)
    if (!current) {
      current = version()
      nominationVersions.set(nomination.id, current)
    }
    return {
      nomination: {
        id: nomination.id,
        campaignId: nomination.campaignId,
        evaluationMonth: campaign.evaluationMonth,
        sponsorEmployeeId: nomination.sponsor.id,
        sponsorPayrollNumber: nomination.sponsor.payrollNumber,
        sponsorFullName: nomination.sponsor.fullName,
        candidateEmployeeId: nomination.candidate.id,
        candidatePayrollNumber: nomination.candidate.payrollNumber,
        candidateFullName: nomination.candidate.fullName,
        qualities: nomination.qualities,
        registeredAtUtc: nomination.registeredAtUtc,
        isCancelled: nomination.isCancelled,
      },
      createdByUserId: nomination.createdByUserId,
      justification: nomination.justification,
      version: current,
    }
  }
  function importRows(file: File) {
    return [
      {
        rowNumber: 2,
        payrollNumber: 'IMPORT-DEMO-001',
        fullName: 'Persona simulada de importación 1',
      },
      {
        rowNumber: 3,
        payrollNumber: 'IMPORT-DEMO-002',
        fullName: 'Persona simulada de importación 2',
      },
      ...(file.name.toLowerCase().includes('errores')
        ? [{ rowNumber: 4, payrollNumber: '', fullName: 'Fila inválida simulada' }]
        : []),
    ]
  }
  function employeePreview(file: File): EmployeeImportPreview {
    const rows = importRows(file).map((row) => ({
      ...row,
      isValid: !!row.payrollNumber,
      errors: row.payrollNumber
        ? []
        : ['Nómina vacía (ejemplo simulado, no se analizó el archivo).'],
      existsInDatabase: employees.some((item) => item.payrollNumber === row.payrollNumber),
    }))
    return {
      totalRows: rows.length,
      validRows: rows.filter((row) => row.isValid).length,
      invalidRows: rows.filter((row) => !row.isValid).length,
      newRows: rows.filter((row) => row.isValid && !row.existsInDatabase).length,
      existingRows: rows.filter((row) => row.existsInDatabase).length,
      rows,
    }
  }
  function sponsorPreview(file: File): SponsorImportPreview {
    const rows: SponsorImportRow[] = importRows(file).map((row) => {
      const catalog = employees.find((item) => item.payrollNumber === row.payrollNumber)
      const account = catalog ? accounts.find((item) => item.employeeId === catalog.id) : undefined
      const status = !row.payrollNumber
        ? 7
        : !catalog
          ? 3
          : catalog.fullName !== row.fullName
            ? 5
            : account
              ? account.roles.length !== 1 || account.roles[0] !== 'Sponsor'
                ? 6
                : account.isActive
                  ? 1
                  : 2
              : 0
      return {
        rowNumber: row.rowNumber,
        payrollNumber: row.payrollNumber,
        excelName: row.fullName,
        catalogName: catalog?.fullName ?? null,
        status,
        message: 'Fila simulada: no se analizó el contenido Excel.',
      }
    })
    return {
      totalRows: rows.length,
      newAccounts: rows.filter((row) => row.status === 0).length,
      skippedAccounts: rows.filter((row) => row.status === 1 || row.status === 2).length,
      errorRows: rows.filter((row) => row.status >= 3).length,
      rows,
    }
  }
  return {
    sponsorActive: () => accounts[1].isActive,
    handle(
      url: URL,
      method: string,
      body: Record<string, unknown>,
      role: string,
      form?: FormData,
    ): Response | null {
      const path = url.pathname
      const adminNomination =
        path === '/api/admin/nominations' ||
        (/^\/api\/admin\/nominations\/[^/]+(?:\/(?:correction|cancel))?$/.test(path) &&
          !path.endsWith('/candidates'))
      if (!path.startsWith('/api/employees') && !path.startsWith('/api/users') && !adminNomination)
        return null
      if (role !== 'Administrator') fail(403, 'Solo administración puede realizar esta operación.')
      const term = (url.searchParams.get('term') ?? '').trim().toLowerCase()
      if (
        path.startsWith('/api/employees/import/') ||
        path.startsWith('/api/users/import/sponsors/')
      ) {
        const file = form?.get('File')
        if (
          !(file instanceof File) ||
          !file.size ||
          file.size > 5 * 1024 * 1024 ||
          !file.name.toLowerCase().endsWith('.xlsx')
        )
          fail(400, 'Selecciona un archivo .xlsx con contenido, de máximo 5 MB.')
        if (path.startsWith('/api/employees/import/')) {
          const preview = employeePreview(file)
          if (path.endsWith('/preview')) return result(preview)
          if (preview.invalidRows) fail(400, 'Corrige las filas inválidas antes de confirmar.')
          let insertedRows = 0
          for (const row of preview.rows) {
            if (!row.existsInDatabase) {
              addEmployee(row.payrollNumber, row.fullName)
              insertedRows++
            }
          }
          return result({
            message: 'Importación simulada terminada; no se analizó el Excel.',
            totalRows: preview.totalRows,
            insertedRows,
            skippedExistingRows: preview.totalRows - insertedRows,
          })
        }
        const preview = sponsorPreview(file)
        if (path.endsWith('/preview')) return result(preview)
        if (form?.get('Confirm') !== 'true')
          fail(400, 'Confirma expresamente la creación de cuentas.')
        if (preview.errorRows) fail(400, 'Corrige las filas con errores antes de confirmar.')
        for (const row of preview.rows) {
          if (row.status === 0)
            addSponsor(employees.find((item) => item.payrollNumber === row.payrollNumber)!.id)
        }
        return result({
          totalRows: preview.totalRows,
          createdAccounts: preview.newAccounts,
          skippedAccounts: preview.skippedAccounts,
        })
      }
      if (path === '/api/employees') {
        if (method === 'GET')
          return result(
            page(
              employees.filter((item) =>
                (item.payrollNumber + ' ' + item.fullName).toLowerCase().includes(term),
              ),
              url,
            ),
          )
        if (method === 'POST')
          return result(addEmployee(text(body, 'payrollNumber'), text(body, 'fullName')), 201)
      }
      if (path.startsWith('/api/employees/by-payroll/')) {
        const payroll = decodeURIComponent(path.slice('/api/employees/by-payroll/'.length))
        return result(
          employees.find((item) => item.payrollNumber.toLowerCase() === payroll.toLowerCase()) ??
            fail(404, 'No encontramos esa nómina.'),
        )
      }
      if (path.startsWith('/api/employees/')) {
        const id = path.split('/')[3],
          item = employee(id)
        if (method === 'GET') return result(item)
        match(body.version, item.version)
        item.fullName = required(text(body, 'fullName'), 200)
        item.version = version()
        return result(item)
      }
      if (path === '/api/users' && method === 'GET') {
        const roleFilter = url.searchParams.get('role')
        const items: AccountListItem[] = accounts
          .map((account) => ({
            ...account,
            employeeFullName:
              employees.find((item) => item.id === account.employeeId)?.fullName ?? null,
          }))
          .filter(
            (account) =>
              (!roleFilter || account.roles.includes(roleFilter)) &&
              (account.userName + ' ' + (account.employeeFullName ?? ''))
                .toLowerCase()
                .includes(term),
          )
        return result(page(items, url))
      }
      if (path === '/api/users/sponsors' || path === '/api/users/departments') {
        let account: Account
        if (path.endsWith('/sponsors')) account = addSponsor(text(body, 'employeeId'))
        else {
          const requested = text(body, 'role'),
            names: Record<string, string> = {
              HumanResources: 'rh',
              Safety: 'seguridad',
              Quality: 'calidad',
            }
          if (!Object.hasOwn(names, requested)) fail(400, 'Selecciona RH, Seguridad o Calidad.')
          if (accounts.some((item) => item.userName === names[requested]))
            fail(409, 'La cuenta departamental ya existe.')
          account = {
            id: crypto.randomUUID(),
            userName: names[requested],
            employeeId: null,
            roles: [requested],
            mustChangePassword: true,
            isActive: true,
          }
          accounts.push(account)
        }
        return result(
          {
            account,
            temporaryPassword: 'Demo!' + crypto.randomUUID(),
            message:
              'Cuenta simulada creada. Contraseña ficticia, visible únicamente en esta respuesta.',
          },
          201,
        )
      }
      if (path.startsWith('/api/users/')) {
        const account =
          accounts.find((item) => item.id === path.split('/')[3]) ??
          fail(404, 'No encontramos la cuenta.')
        if (method === 'PATCH') {
          if (account.roles.length !== 1 || account.roles[0] !== 'Sponsor')
            fail(400, 'Solo se permite cambiar el estado de cuentas Sponsor.')
          if (typeof body.isActive !== 'boolean') fail(400, 'Indica el estado de la cuenta.')
          account.isActive = body.isActive
        }
        return result(account)
      }
      if (path === '/api/admin/nominations') {
        const campaignFilter = url.searchParams.get('campaignId'),
          cancelled = url.searchParams.get('isCancelled')
        const rows = nominations
          .map((item) => detail(item).nomination)
          .filter(
            (item) =>
              (!campaignFilter || item.campaignId === campaignFilter) &&
              (!cancelled || item.isCancelled === (cancelled === 'true')) &&
              [
                item.candidateFullName,
                item.candidatePayrollNumber,
                item.sponsorFullName,
                item.sponsorPayrollNumber,
              ]
                .join(' ')
                .toLowerCase()
                .includes(term),
          )
        return result(page(rows, url))
      }
      const nomination =
        nominations.find((item) => item.id === path.split('/')[4]) ??
        fail(404, 'No encontramos la postulación.')
      if (method === 'GET') return result(detail(nomination))
      match(body.version, detail(nomination).version)
      if (nomination.isCancelled || campaign.isArchived)
        fail(409, 'La postulación está anulada o la convocatoria archivada.')
      required(text(body, 'reason'), 1000)
      if (path.endsWith('/cancel')) {
        nomination.isCancelled = true
        nominationVersions.set(nomination.id, version())
        return result(detail(nomination))
      }
      const flags = body.qualities
      if (typeof flags !== 'number' || !Number.isInteger(flags) || flags < 1 || flags > 15)
        fail(400, 'Selecciona al menos una cualidad.')
      const justification = required(text(body, 'justification'), 500)
      const changed = nomination.qualities !== flags || nomination.justification !== justification
      if (changed) {
        nomination.qualities = flags
        nomination.justification = justification
        nominationVersions.set(nomination.id, version())
      }
      return result({
        detail: detail(nomination),
        changed,
        message: changed ? 'Postulación corregida.' : 'No hubo cambios.',
      })
    },
  }
}
