import { NavLink, Outlet } from 'react-router'
import { logout, roles, useAuth } from '@/features/auth/session'
export function AppLayout() {
  const user = useAuth()!
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
        <div>
          <p className="eyebrow">Manufacturas Especializadas</p>
          <p className="text-xl font-bold">EmpleadoDelMes</p>
        </div>
        <div>
          <p className="font-semibold">{user.displayName || user.userName}</p>
          <p className="text-sm text-slate-500">
            {roles
              .filter((r) => user.roles.includes(r.name))
              .map((r) => r.label)
              .join(' · ')}
          </p>
        </div>
        <button onClick={logout}>Cerrar sesión</button>
      </header>
      <div className="mx-auto grid max-w-7xl md:grid-cols-[240px_1fr]">
        <aside className="p-6">
          <nav aria-label="Navegación principal" className="flex flex-wrap gap-2 md:flex-col">
            {roles
              .filter((r) => user.roles.includes(r.name))
              .map((r) => (
                <NavLink
                  key={r.name}
                  to={r.path}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 ${isActive ? 'bg-teal-900 text-white' : 'text-slate-700'}`
                  }
                >
                  {r.label}
                </NavLink>
              ))}

            {user.roles.includes('Administrator') && (
              <NavLink
                to="/admin/campaigns"
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive ? 'bg-teal-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                Convocatorias
              </NavLink>
            )}

            <NavLink to="/change-password" className="px-4 py-3">
              Cambiar contraseña
            </NavLink>
          </nav>
        </aside>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
