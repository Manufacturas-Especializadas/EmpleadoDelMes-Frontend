import { Link, Route, Routes } from 'react-router'
import { HomePage } from '@/pages/HomePage'
import { NavigationTestPage } from '@/pages/NavigationTestPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4"
        >
          <Link to="/" className="font-semibold text-slate-900">
            Inicio
          </Link>

          <Link to="/prueba-rutas" className="text-blue-700 hover:underline">
            Prueba de navegación
          </Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/prueba-rutas" element={<NavigationTestPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
