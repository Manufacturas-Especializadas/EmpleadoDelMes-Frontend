import { Link, Navigate, Outlet, Route, Routes } from 'react-router'
import { home, roles, useAuth } from '@/features/auth/session'
import { AuthPage } from '@/pages/AuthPage'
import { HomePage } from '@/pages/HomePage'
import { AppLayout } from '@/shared/components/AppLayout'
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
      <Link to="/" className="mt-6 inline-block text-teal-800">
        Volver al inicio
      </Link>
    </main>
  )
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/login" element={<AuthPage key="login" />} />
      <Route path="/change-password" element={<AuthPage key="change" change />} />
      <Route element={<Guard />}>
        <Route element={<AppLayout />}>
          {roles.map((role) => (
            <Route key={role.name} element={<Guard role={role.name} />}>
              <Route path={role.path} element={<HomePage role={role.label} />} />
            </Route>
          ))}
        </Route>
      </Route>
      <Route path="/access-denied" element={<Message title="Acceso denegado" />} />
      <Route path="*" element={<Message title="Página no encontrada" />} />
    </Routes>
  )
}
