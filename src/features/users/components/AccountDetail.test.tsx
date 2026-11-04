import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { AccountDetail } from './AccountDetail'
const state = vi.hoisted(() => ({ employeeId: null as string | null }))
vi.mock('@/shared/hooks/useQuery', () => ({
  useQuery: (key: string, _load: unknown, enabled = true) => ({
    data: !enabled
      ? undefined
      : key === 'account'
        ? {
            userName: 'RH',
            roles: ['HumanResources'],
            isActive: true,
            employeeId: state.employeeId,
          }
        : { fullName: 'Persona de prueba', payrollNumber: '001' },
    loading: false,
    reload: vi.fn(),
  }),
}))
vi.mock('@/shared/components/Modal', () => ({
  Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/shared/components/ConfirmDialog', () => ({ ConfirmDialog: () => null }))
it('describe cuentas sin vínculo y resuelve nombre y nómina sin mostrar GUID', () => {
  const render = () =>
    renderToStaticMarkup(<AccountDetail id="account" onClose={() => {}} onSaved={() => {}} />)
  expect(render()).toContain('Cuenta sin empleado vinculado')
  state.employeeId = 'internal-guid'
  expect(render()).toContain('Persona de prueba')
  expect(render()).toContain('001')
  expect(render()).not.toContain('internal-guid')
})
