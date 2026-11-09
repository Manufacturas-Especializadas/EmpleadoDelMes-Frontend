import { Icon } from '@/shared/components/Icon'
import { Link } from 'react-router'
import { useAuth } from '@/features/auth'
import { managementModules, navigationIcon } from '../navigation'
export function HomePage({ role }: { role: string }) {
  const user = useAuth()
  const modules = managementModules(user?.roles ?? [])
  return (
    <div className="space-y-8">
      <section className="welcome-panel">
        <div className="mb-6 flex items-center gap-3">
          <span className="icon-tile">
            <Icon name="award" />
          </span>
          <p className="eyebrow">Reconocimiento MESA · {role}</p>
        </div>
        <h1 className="max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl">
          Bienvenido, {user?.displayName || user?.userName}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
          Empleado del Mes · Tu espacio de trabajo para el proceso de reconocimiento.
        </p>
      </section>
      {modules.length > 0 &&
        ['Proceso de reconocimiento', 'Administración', 'Configuración'].filter((group) => modules.some((item) => item.group === group)).map((group) => (
          <section key={group}>
            <h2 className="mb-4 text-xl font-semibold">{group}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {modules
                .filter((item) => item.group === group)
                .map((item) => (
                  <Link key={item.path} to={item.path} className="module-card group">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="icon-tile">
                        <Icon name={navigationIcon(item.path)} />
                      </span>
                      <Icon
                        name="arrow"
                        className="size-4 text-muted transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                    <h3 className="text-base font-semibold text-ink">{item.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
    </div>
  )
}
