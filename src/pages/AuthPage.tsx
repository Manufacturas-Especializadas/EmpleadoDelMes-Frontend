import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { changePassword, home, login, logout, useAuth } from '@/features/auth/session'
export function AuthPage({ change = false }: { change?: boolean }) {
  const user = useAuth()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!change && user) return <Navigate to={home(user)} replace />
  if (change && !user) return <Navigate to="/login" replace />
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const password = String(data.get('password'))
    const next = String(data.get('next'))
    if (change && (next.length < 12 || next !== data.get('confirm') || next === password)) {
      setError('Usa al menos 12 caracteres, una contraseña diferente y una confirmación idéntica.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (change) {
        await changePassword(password, next)
        navigate('/login?changed=1', { replace: true })
      } else await login(String(data.get('userName')).trim(), password)
      form.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error inesperado.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="eyebrow">Manufacturas Especializadas</p>
        <h1 className="mt-3 text-3xl font-bold">
          {change ? 'Cambia tu contraseña' : 'EmpleadoDelMes'}
        </h1>
        <p className="my-5 text-slate-600">
          {change
            ? 'Actualiza tu contraseña antes de continuar.'
            : 'Inicia sesión con tu cuenta institucional.'}
        </p>
        {!change && new URLSearchParams(location.search).has('changed') && (
          <p role="status" className="mb-4 text-emerald-800">
            Contraseña actualizada. Inicia sesión nuevamente.
          </p>
        )}
        <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
          {!change && (
            <label>
              Usuario
              <input name="userName" autoComplete="username" required disabled={busy} />
            </label>
          )}
          <label>
            {change ? 'Contraseña actual' : 'Contraseña'}
            <input
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </label>
          {change && (
            <>
              <label>
                Nueva contraseña
                <input
                  name="next"
                  type={visible ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={12}
                  required
                  disabled={busy}
                />
              </label>
              <label>
                Confirmación
                <input
                  name="confirm"
                  type={visible ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={12}
                  required
                  disabled={busy}
                />
              </label>
              <p className="text-sm text-slate-500">Mínimo 12 caracteres.</p>
            </>
          )}
          <button
            type="button"
            className="text-sm text-teal-800"
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
          </button>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
              {error}
            </p>
          )}
          <button disabled={busy} className="primary w-full">
            {busy ? 'Procesando…' : change ? 'Actualizar contraseña' : 'Iniciar sesión'}
          </button>
        </form>
        {change && (
          <button className="mt-5" onClick={logout}>
            Cerrar sesión
          </button>
        )}
      </section>
    </main>
  )
}
