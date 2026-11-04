export function HomePage({ role }: { role: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8">
      <p className="eyebrow">Tu espacio de trabajo</p>
      <h1 className="mt-3 text-3xl font-bold">{role}</h1>
      <p className="mt-4 text-slate-600">Bienvenido a EmpleadoDelMes.</p>
      <nav aria-label="Módulos administrativos" className="mt-6 flex flex-wrap gap-4">
        <Link className="primary" to="/admin/campaigns">
          Convocatorias
        </Link>
        <Link className="primary" to="/admin/preselections">
          Preselección
        </Link>
        <Link className="primary" to="/admin/review">
          Revisión integral
        </Link>
      </nav>
    </section>
  )
}
import { Link } from 'react-router'
