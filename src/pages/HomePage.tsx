export function HomePage({ role }: { role: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8">
      <p className="eyebrow">Tu espacio de trabajo</p>
      <h1 className="mt-3 text-3xl font-bold">{role}</h1>
      <p className="mt-4 text-slate-600">Bienvenido a EmpleadoDelMes.</p>
      <p className="mt-6 rounded-xl bg-slate-50 p-5 text-slate-600">
        Los módulos de esta área estarán disponibles en próximas etapas.
      </p>
    </section>
  )
}
