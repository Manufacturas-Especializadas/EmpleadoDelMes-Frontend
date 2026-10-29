import { appConfig } from '@/shared/config/env'

export function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Configuración técnica
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">{appConfig.name}</h1>

          <p className="mt-4 text-slate-600">
            Frontend configurado con React, TypeScript, Vite y Tailwind CSS.
          </p>

          <div className="mt-6 space-y-2 text-sm text-slate-600">
            <p>
              <strong>Ambiente:</strong> {appConfig.mode}
            </p>

            <p>
              <strong>API:</strong> {appConfig.apiBaseUrl || 'Pendiente de configurar'}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
