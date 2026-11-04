import { Link } from 'react-router'
import { useAuth } from '@/features/auth'
import { adminModules } from '../navigation'
export function HomePage({ role }: { role: string }) {
  const user = useAuth()
  return (
    <div className="space-y-8">
      <section className="surface-panel p-6 sm:p-8">
        <p className="eyebrow">{role}</p>
        <h1 className="mt-3 text-3xl font-bold">
          Bienvenido, {user?.displayName || user?.userName}
        </h1>
        <p className="mt-3 text-muted">
          Empleado del Mes · Tu espacio de trabajo para el proceso de reconocimiento.
        </p>
      </section>
      {user?.roles.includes('Administrator') &&
        ['Proceso de reconocimiento', 'Administración'].map((group) => (
          <section key={group}>
            <h2 className="mb-4 text-xl font-semibold">{group}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {adminModules
                .filter((item) => item.group === group)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="surface-panel group p-5 transition-shadow hover:shadow-md"
                  >
                    <h3 className="font-semibold text-primary group-hover:underline">
                      {item.label} <span aria-hidden="true">→</span>
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
    </div>
  )
}
