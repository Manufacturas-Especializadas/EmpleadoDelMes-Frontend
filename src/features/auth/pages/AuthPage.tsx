import { SuccessMessage } from '@/shared/components/SuccessMessage'
import { Icon } from '@/shared/components/Icon'
import { BrandLogo } from '@/shared/components/BrandLogo'
import { TextField } from '@/shared/components/TextField'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { changePassword, home, login, logout, useAuth } from '../session'
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
    <main className="auth-shell">
      <div className="hidden lg:block">
        <span className="icon-tile mb-8">
          <Icon name="award" />
        </span>
        <p className="eyebrow">Manufacturas Especializadas</p>
        <h2 className="mt-5 max-w-lg text-5xl leading-[1.12] font-semibold tracking-tight">
          El talento de nuestra gente merece reconocimiento.
        </h2>
        <p className="mt-6 max-w-md text-lg leading-8 text-muted">
          Un espacio para reconocer a quienes hacen la diferencia en MESA.
        </p>
        <div className="mt-10 flex items-center gap-3 border-t border-border pt-6 text-sm text-muted">
          <Icon name="users" />
          Empleado del Mes · Plataforma interna
        </div>
      </div>
      <section className="auth-panel">
        <BrandLogo />
        <p className="eyebrow mt-5">Manufacturas Especializadas</p>
        <h1 className="mt-4 text-3xl font-semibold">
          {change ? 'Cambia tu contraseña' : 'Empleado del Mes'}
        </h1>
        <p className="my-5 text-muted">
          {change
            ? 'Actualiza tu contraseña antes de continuar.'
            : 'Inicia sesión con tu cuenta institucional.'}
        </p>
        {!change && new URLSearchParams(location.search).has('changed') && (
          <SuccessMessage>Contraseña actualizada. Inicia sesión nuevamente.</SuccessMessage>
        )}
        <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
          {import.meta.env.DEV &&
            (import.meta.env.VITE_DEMO === 'true' ||
              import.meta.env.VITE_DEMO_CAMPAIGNS === 'true') &&
            !change && (
              <div className="rounded border border-amber-300 p-3">
                <p>Demostración local: elige un perfil sin credenciales.</p>
                {['Administrator', 'Sponsor', 'HumanResources', 'Safety', 'Quality'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    disabled={busy}
                    className="secondary m-1 text-sm"
                    onClick={async () => {
                      setBusy(true)
                      setError('')
                      try {
                        await login(role, 'demo')
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : 'No se pudo abrir la demostración.',
                        )
                      } finally {
                        setBusy(false)
                      }
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          {!change && (
            <TextField
              label="Usuario"
              name="userName"
              autoComplete="username"
              required
              disabled={busy}
            />
          )}
          <TextField
            label={change ? 'Contraseña actual' : 'Contraseña'}
            name="password"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            required
            disabled={busy}
          />
          {change && (
            <>
              <TextField
                label="Nueva contraseña"
                name="next"
                type={visible ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={12}
                required
                disabled={busy}
              />
              <TextField
                label="Confirmación"
                name="confirm"
                type={visible ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={12}
                required
                disabled={busy}
              />
              <p className="text-sm text-muted">Mínimo 12 caracteres.</p>
            </>
          )}
          <button
            type="button"
            className="quiet -ml-3 text-sm"
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
            {busy ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              <Icon name={change ? 'lock' : 'arrow'} />
            )}
            {busy ? 'Procesando…' : change ? 'Actualizar contraseña' : 'Iniciar sesión'}
          </button>
        </form>
        {change && (
          <button className="quiet mt-5 w-full" onClick={logout}>
            Cerrar sesión
          </button>
        )}
      </section>
    </main>
  )
}
