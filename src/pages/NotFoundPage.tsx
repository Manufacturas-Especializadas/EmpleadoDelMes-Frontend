import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="text-sm font-semibold text-blue-700">Error 404</p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">Página no encontrada</h1>

      <p className="mt-4 text-slate-600">La dirección solicitada no existe.</p>

      <Link to="/" className="mt-6 inline-block font-medium text-blue-700 hover:underline">
        Volver al inicio
      </Link>
    </main>
  )
}
