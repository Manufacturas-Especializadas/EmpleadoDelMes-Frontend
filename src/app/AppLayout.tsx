import { Icon } from '@/shared/components/Icon'
import { useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { logout, roles, useAuth } from '@/features/auth'
import { BrandLogo } from '@/shared/components/BrandLogo'
import { adminModules, navigationIcon, sponsorModules } from './navigation'
export function AppLayout() {
  const user = useAuth()!
  const location = useLocation()
  const [openAt, setOpenAt] = useState<string | null>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const open = openAt === location.key
  const allowedRoles = roles.filter((role) => user.roles.includes(role.name))
  const modules = user.roles.includes('Administrator') ? adminModules : []
  const current = modules.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  )
  const groups = [
    {
      label: 'General',
      items: allowedRoles.map((role) => ({
        path: role.path,
        label:
          role.name === 'Administrator'
            ? 'Inicio'
            : role.name === 'Sponsor'
              ? 'Mis postulaciones'
              : `Opiniones · ${role.label}`,
      })),
    },
    ...(user.roles.includes('Sponsor') ? [{ label: 'Mi equipo', items: sponsorModules }] : []),
    ...['Proceso de reconocimiento', 'Administración', 'Configuración'].map((label) => ({
      label,
      items: modules.filter((item) => item.group === label),
    })),
    { label: 'Mi cuenta', items: [{ path: '/change-password', label: 'Cambiar contraseña' }] },
  ]
  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-4">
        Saltar al contenido
      </a>
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo />
            <div>
              <p className="eyebrow hidden sm:block">Manufacturas Especializadas</p>
              <p className="text-base font-semibold sm:text-xl">Empleado del Mes</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-3 lg:ml-auto">
            <span className="icon-tile hidden sm:inline-flex">
              <Icon name="shield" />
            </span>
            <div className="min-w-0">
              <p className="break-words font-semibold">{user.displayName || user.userName}</p>
              <p className="text-sm text-muted">
                {allowedRoles.map((role) => role.label).join(' · ')}
              </p>
            </div>
          </div>
          <button
            ref={toggle}
            type="button"
            className="secondary lg:hidden"
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpenAt(open ? null : location.key)}
          >
            <Icon name={open ? 'close' : 'menu'} />
            {open ? 'Cerrar menú' : 'Abrir menú'}
          </button>
        </div>
      </header>
      {import.meta.env.DEV &&
        (import.meta.env.VITE_DEMO === 'true' ||
          import.meta.env.VITE_DEMO_CAMPAIGNS === 'true') && (
          <p className="border-b border-amber-200 bg-warning-soft px-6 py-3 text-sm text-warning">
            Demostración · datos ficticios en memoria. Las importaciones muestran filas simuladas;
            no analizan el Excel.
          </p>
        )}
      <div className="mx-auto grid max-w-screen-2xl lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside
          className="app-sidebar"
          data-open={open}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpenAt(null)
              toggle.current?.focus()
            }
          }}
        >
          <div className="sidebar-clip">
            <div className="sidebar-inner">
              <nav id="main-navigation" aria-label="Navegación principal">
                {groups
                  .filter((group) => group.items.length)
                  .map((group) => (
                    <section key={group.label} className="nav-group">
                      <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                        {group.label}
                      </h2>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item.path}>
                            <NavLink
                              end={allowedRoles.some((role) => role.path === item.path)}
                              to={item.path}
                              onClick={() => {
                                setOpenAt(null)
                                if (open) toggle.current?.focus()
                              }}
                              className={({ isActive }) =>
                                `nav-item ${isActive ? 'nav-item-active' : ''}`
                              }
                            >
                              <Icon name={navigationIcon(item.path)} />
                              <span>{item.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                      {group.label === 'Mi cuenta' && (
                        <button onClick={logout} className="nav-item w-full text-left">
                          <Icon name="logout" />
                          Cerrar sesión
                        </button>
                      )}
                    </section>
                  ))}
              </nav>
            </div>
          </div>
        </aside>
        <main id="main-content" tabIndex={-1} className="min-w-0 p-4 sm:p-6 lg:p-8">
          {current && (
            <nav
              aria-label="Ruta de navegación"
              className="mb-6 flex flex-wrap gap-2 text-sm text-muted"
            >
              <Link className="hover:underline" to="/admin">
                Inicio
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">
                {current.label}
                {location.pathname !== current.path ? ' · Detalle' : ''}
              </span>
            </nav>
          )}
          <div className="screen-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
