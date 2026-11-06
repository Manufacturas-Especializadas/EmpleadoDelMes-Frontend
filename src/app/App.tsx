import { useEffect } from 'react'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router'
import {
  home,
  initializeSession,
  logout,
  roles,
  useAuth,
  useSessionInitialization,
} from '@/features/auth/session'
import { AuthPage } from '@/features/auth'
import { HomePage } from './pages/HomePage'
import { AppLayout } from './AppLayout'
import { CampaignsPage, CampaignDetailPage } from '@/features/campaigns'
import { NominationsPage } from '@/features/nominations'
import { PreselectionsPage } from '@/features/preselections'
import { OpinionsPage } from '@/features/opinions'
import { ReviewPage } from '@/features/review'
import { EmployeesPage } from '@/features/employees'
import { UsersPage } from '@/features/users'
import { EmployeeImportPage, SponsorImportPage } from '@/features/imports'
import { AdminNominationsPage } from '@/features/adminNominations'
import { CampaignAutomationPage } from '@/features/campaignAutomation/CampaignAutomationPage'

function Guard({ role }: { role?: string }) {
  const user = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />
  if (role && !user.roles.includes(role)) return <Navigate to="/access-denied" replace />
  return <Outlet />
}
function Start() {
  const user = useAuth()
  return <Navigate to={user ? home(user) : '/login'} replace />
}
function Message({ title }: { title: string }) {
  return (
    <main className="p-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Link to="/" className="mt-6 inline-block text-primary">
        Volver al inicio
      </Link>
    </main>
  )
}
export default function App() {
  const initialization = useSessionInitialization()
  const navigate = useNavigate()
  useEffect(() => {
    void initializeSession()
  }, [])
  function goToLogin() {
    logout()
    navigate('/login', { replace: true })
  }
  if (initialization.status !== 'ready') {
    return (
      <main className="mx-auto max-w-xl space-y-4 p-4 sm:p-8">
        <h1 className="text-2xl font-semibold">Empleado del Mes</h1>
        {initialization.status === 'initializing' ? (
          <>
            <LoadingState message="Restaurando tu sesión…" />
            <button className="secondary" onClick={goToLogin}>
              Cancelar e iniciar sesión
            </button>
          </>
        ) : (
          <>
            <ErrorState
              message={initialization.message ?? 'No pudimos restaurar tu sesión.'}
              onRetry={() => {
                void initializeSession()
              }}
            />
            <p className="text-sm text-muted">
              Puedes reintentar la conexión o descartar esta sesión e iniciar sesión nuevamente.
            </p>
            <button className="secondary" onClick={goToLogin}>
              Ir al inicio de sesión
            </button>
          </>
        )}
      </main>
    )
  }
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/login" element={<AuthPage key="login" />} />
      <Route path="/change-password" element={<AuthPage key="change" change />} />
      <Route element={<Guard />}>
        <Route element={<AppLayout />}>
          {roles.map((role) => (
            <Route key={role.name} element={<Guard role={role.name} />}>
              <Route
                path={role.path}
                element={
                  role.name === 'Sponsor' ? (
                    <NominationsPage />
                  ) : ['HumanResources', 'Safety', 'Quality'].includes(role.name) ? (
                    <OpinionsPage />
                  ) : (
                    <HomePage role={role.label} />
                  )
                }
              />
            </Route>
          ))}

          <Route element={<Guard role="Administrator" />}>
            <Route
              path="/admin/settings/campaign-automation"
              element={<CampaignAutomationPage />}
            />
            <Route path="/admin/campaigns" element={<CampaignsPage />} />
            <Route path="/admin/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/admin/preselections" element={<PreselectionsPage />} />
            <Route path="/admin/review" element={<ReviewPage />} />
            <Route path="/admin/employees" element={<EmployeesPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/imports/employees" element={<EmployeeImportPage />} />
            <Route path="/admin/imports/sponsors" element={<SponsorImportPage />} />
            <Route path="/admin/nominations" element={<AdminNominationsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/access-denied" element={<Message title="Acceso denegado" />} />
      <Route path="*" element={<Message title="Página no encontrada" />} />
    </Routes>
  )
}
