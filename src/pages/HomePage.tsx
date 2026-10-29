import { useEffect, useState } from 'react'
import { appConfig } from '@/shared/config/env'
import { getPing, type PingResponse } from '@/shared/api/pingApi'

type ApiState =
  | { status: 'loading' }
  | { status: 'success'; data: PingResponse }
  | { status: 'error'; message: string }

export function HomePage() {
  const [apiState, setApiState] = useState<ApiState>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function checkApi() {
      try {
        const data = await getPing(controller.signal)

        if (!controller.signal.aborted) {
          setApiState({ status: 'success', data })
        }
      } catch (error) {
        if (controller.signal.aborted) return

        setApiState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Error inesperado',
        })
      }
    }

    void checkApi()

    return () => controller.abort()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Configuración técnica
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">{appConfig.name}</h1>

          <p className="mt-3 text-slate-600">Integración React + ASP.NET Core</p>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {apiState.status === 'loading' && (
              <p className="text-slate-600">Comprobando conexión con la API...</p>
            )}

            {apiState.status === 'success' && (
              <div className="space-y-2">
                <p className="font-semibold text-green-700">API conectada correctamente</p>

                <p className="text-sm text-slate-600">{apiState.data.message}</p>
              </div>
            )}

            {apiState.status === 'error' && (
              <div className="space-y-2">
                <p className="font-semibold text-red-700">No fue posible conectar con la API</p>

                <p className="text-sm text-red-600">{apiState.message}</p>
              </div>
            )}
          </div>

          <p className="mt-6 text-sm text-slate-500">Ambiente: {appConfig.mode}</p>
        </section>
      </div>
    </main>
  )
}
