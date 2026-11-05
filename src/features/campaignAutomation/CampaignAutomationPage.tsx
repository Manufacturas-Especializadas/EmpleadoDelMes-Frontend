import { useEffect, useState } from 'react'
import { ApiError } from '@/shared/api/httpClient'
import { useQuery } from '@/shared/hooks/useQuery'
import { useOperation } from '@/shared/hooks/useOperation'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { Icon } from '@/shared/components/Icon'
import { LoadingState } from '@/shared/components/LoadingState'
import { PageHeader } from '@/shared/components/PageHeader'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { SuccessMessage } from '@/shared/components/SuccessMessage'
import { TextField } from '@/shared/components/TextField'
import { ToggleSwitch } from '@/shared/components/ToggleSwitch'
import { formatMonth } from '@/shared/utils/formatDate'
import { automationDemo, getAutomation, previewAutomation, saveAutomation } from './automationApi'
import { calendarError, emptyCalendar, periods, plantDate, relativeDayHint } from './presentation'
import { PreviewResults } from './PreviewResults'
import type { AutomationCalendar, AutomationPreview, AutomationState } from './types'

export function CampaignAutomationPage() {
  const query = useQuery('campaign-automation', getAutomation, !automationDemo)
  const [message, setMessage] = useState('')
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Automatización de convocatorias"
        description="Un calendario mensual para el reconocimiento. Configura los periodos y revisa las fechas antes de guardar."
      />
      {automationDemo ? (
        <EmptyState
          title="No disponible en demostración"
          description="Este panel requiere la configuración real del backend. No se consultan ni simulan resultados de automatización en modo demo."
        />
      ) : (
        <>
          {message && <SuccessMessage>{message}</SuccessMessage>}
          {query.loading && <LoadingState variant="cards" />}
          {query.error && (
            <>
              <ErrorState message={query.error} onRetry={query.reload} />
              <p className="text-sm text-muted">
                Si el servicio no está disponible, solicita verificar la disponibilidad del backend
                y la migración de configuración SQL. Este panel no ejecuta migraciones.
              </p>
            </>
          )}
          {query.data && (
            <AutomationEditor
              key={query.data.configuration.version}
              state={query.data}
              onReload={query.reload}
              onEdit={() => setMessage('')}
              onSaved={() => {
                setMessage('Configuración guardada correctamente.')
                query.reload()
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

function AutomationEditor({
  state,
  onReload,
  onSaved,
  onEdit,
}: {
  state: AutomationState
  onReload: () => void
  onSaved: () => void
  onEdit: () => void
}) {
  const initialCalendar = state.configuration.calendar ?? emptyCalendar
  const [calendar, setCalendar] = useState<AutomationCalendar>(initialCalendar)
  const [enabled, setEnabled] = useState(state.configuration.isEnabled)
  const [preview, setPreview] = useState<AutomationPreview | null>(null)
  const [upcomingMonths, setUpcomingMonths] = useState(3)
  const [dialog, setDialog] = useState<'save' | 'reload' | null>(null)
  const [validation, setValidation] = useState('')
  const [conflict, setConflict] = useState(false)
  const save = useOperation()
  const calculation = useOperation()
  const busy = save.busy || calculation.busy
  const dirty =
    enabled !== state.configuration.isEnabled ||
    Object.keys(emptyCalendar).some(
      (key) =>
        calendar[key as keyof AutomationCalendar] !==
        initialCalendar[key as keyof AutomationCalendar],
    )
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  function edit() {
    onEdit()
    setValidation('')
    setPreview(null)
    save.clearError()
    calculation.clearError()
  }
  function change<K extends keyof AutomationCalendar>(key: K, value: AutomationCalendar[K]) {
    edit()
    setCalendar((current) => ({ ...current, [key]: value }))
  }
  function validate() {
    const error = calendarError(calendar)
    setValidation(error ?? '')
    return !error
  }
  function refresh() {
    if (dirty) setDialog('reload')
    else onReload()
  }
  async function confirmSave(signal: AbortSignal) {
    if (!dirty || conflict || !validate()) return
    try {
      await saveAutomation(
        { isEnabled: enabled, calendar, version: state.configuration.version },
        signal,
      )
      if (!signal.aborted) {
        setDialog(null)
        onSaved()
      }
    } catch (error) {
      if (!signal.aborted && error instanceof ApiError && error.status === 409) {
        setConflict(true)
        setDialog(null)
      }
      throw error
    }
  }
  const info = state.operationalStatus
  return (
    <>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!busy && !conflict && dirty && validate()) {
            save.clearError()
            setDialog('save')
          }
        }}
      >
        <section
          className="surface-panel space-y-4 p-5 sm:p-6"
          aria-labelledby="automation-general"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="automation-general" className="flex items-center gap-3 text-lg font-semibold">
              <Icon name="calendar" />
              Automatización general
            </h2>
            <StatusBadge tone={state.effectiveEnabled ? 'success' : 'warning'}>
              {state.effectiveEnabled ? 'Generación habilitada' : 'Generación bloqueada o pausada'}
            </StatusBadge>
          </div>
          <p className="text-sm text-muted">
            El estado mostrado corresponde a la configuración guardada. El interruptor prepara un
            cambio; solo se aplica al confirmar «Guardar configuración».
          </p>
          <ToggleSwitch
            label="Activación administrativa (al guardar)"
            checked={enabled}
            disabled={busy}
            onChange={(value) => {
              edit()
              setEnabled(value)
            }}
          />
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Zona horaria empresarial</dt>
              <dd className="mt-1 font-medium break-words">{state.timeZone}</dd>
            </div>
            <div>
              <dt className="text-muted">Permiso técnico de Azure</dt>
              <dd className="mt-1 font-medium">
                {state.technicalEnabled ? 'Habilitado' : 'Bloqueado'}
              </dd>
            </div>
          </dl>
          {!state.technicalEnabled && (
            <p className="rounded-xl bg-info-soft p-4 text-sm text-info">
              Azure no permite ejecutar el generador. Aunque actives la configuración
              administrativa, no se crearán convocatorias hasta que el responsable técnico habilite
              la ejecución. Este panel no modifica Azure.
            </p>
          )}
          {state.legacyScheduleDetected && (
            <p role="alert" className="rounded-xl bg-warning-soft p-4 text-sm text-warning">
              El backend detectó un calendario heredado. La generación está bloqueada y no se puede
              activar la configuración hasta que el responsable técnico retire esos ajustes.
            </p>
          )}
        </section>
        <p className="text-sm leading-6 text-muted">
          Los días se cuentan desde el primer día del mes siguiente al evaluado. Un número negativo
          adelanta la fecha. Ejemplo de calendario anticipado: apertura −8 a las 00:00 y cierre 7 a
          las 00:00 en ambos periodos. Para octubre de 2026 corresponde al 24 de octubre y al 8 de
          noviembre. El día −8 abre siete días antes del último día de cada mes; el cierre deja
          completos los primeros siete días del mes siguiente. Todas las horas son de Monterrey.
          Este ejemplo no cambia tus valores guardados: revísalos y confirma cualquier modificación.
        </p>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {periods.map(({ prefix, title, description }) => (
            <fieldset key={prefix} disabled={busy} className="surface-panel min-w-0 p-5 sm:p-6">
              <legend className="px-2 text-lg font-semibold">{title}</legend>
              <p className="mb-5 text-sm text-muted">{description}</p>
              {(['Opening', 'Closing'] as const).map((point) => (
                <div key={point} className="mb-5 grid min-w-0 gap-3 sm:grid-cols-2">
                  <TextField
                    label={`Día relativo de ${point === 'Opening' ? 'apertura' : 'cierre'}`}
                    type="number"
                    inputMode="text"
                    min={-31}
                    max={365}
                    step={1}
                    required
                    value={calendar[`${prefix}${point}DayOffset`] ?? ''}
                    onChange={(event) =>
                      change(
                        `${prefix}${point}DayOffset`,
                        event.target.value === '' ? null : Number(event.target.value),
                      )
                    }
                    hint={relativeDayHint(calendar[`${prefix}${point}DayOffset`])}
                  />
                  <TextField
                    label={`Hora de ${point === 'Opening' ? 'apertura' : 'cierre'}`}
                    type="time"
                    step={60}
                    required
                    value={calendar[`${prefix}${point}LocalTime`] ?? ''}
                    onChange={(event) =>
                      change(`${prefix}${point}LocalTime`, event.target.value || null)
                    }
                    hint="Horario de Monterrey."
                  />
                </div>
              ))}
            </fieldset>
          ))}
        </div>
        {validation && (
          <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">
            {validation}
          </p>
        )}
        <section
          className="surface-panel space-y-4 p-5 sm:p-6"
          aria-labelledby="automation-preview"
        >
          <h2 id="automation-preview" className="text-lg font-semibold">
            Vista previa
          </h2>
          <p className="text-sm text-muted">
            Revisa el mes actual, los meses históricos pendientes autorizados y los futuros
            planificados. Recuperar una convocatoria no recupera postulaciones u opiniones de
            periodos transcurridos. Las convocatorias existentes conservan sus periodos. El servidor
            valida solapamientos y horarios ambiguos o inexistentes.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-48">
              <label htmlFor="automation-months">Meses próximos</label>
              <select
                id="automation-months"
                value={upcomingMonths}
                disabled={busy}
                onChange={(event) => {
                  setUpcomingMonths(Number(event.target.value))
                  setPreview(null)
                  calculation.clearError()
                }}
              >
                {[1, 3, 6, 12, 24].map((value) => (
                  <option key={value} value={value}>
                    {value} mes(es)
                  </option>
                ))}
              </select>
            </div>
            <button
              className="secondary w-full sm:w-auto"
              type="button"
              disabled={busy}
              onClick={() => {
                if (validate()) {
                  setPreview(null)
                  void calculation.run(async (signal) => {
                    const result = await previewAutomation({ calendar, upcomingMonths }, signal)
                    if (!signal.aborted) setPreview(result)
                  })
                }
              }}
            >
              <Icon name="review" />
              {calculation.busy ? 'Calculando…' : 'Calcular vista previa'}
            </button>
          </div>
          {calculation.busy && <LoadingState />}
          {calculation.error && <ErrorState message={calculation.error} />}
          {preview && <PreviewResults preview={preview} />}
          {!preview && !calculation.busy && !calculation.error && (
            <p className="text-sm text-muted">
              Completa el calendario y calcula la vista previa. No se guarda ningún cambio.
            </p>
          )}
        </section>
        <section className="surface-panel space-y-4 p-5 sm:p-6" aria-labelledby="automation-status">
          <h2 id="automation-status" className="text-lg font-semibold">
            Información y estado guardado
          </h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              ['Permiso técnico', state.technicalEnabled ? 'Habilitado' : 'Bloqueado'],
              [
                'Configuración administrativa',
                state.configuration.isEnabled ? 'Activada' : 'Pausada',
              ],
              [
                'Primer mes recuperable',
                state.firstEvaluationMonth
                  ? formatMonth(state.firstEvaluationMonth)
                  : 'No informado',
              ],
              [
                'Última actualización de configuración',
                plantDate(state.configuration.updatedAtUtc),
              ],
              ['Última comprobación', plantDate(info.lastCheckAtUtc)],
              ['Última generación exitosa', plantDate(info.lastGenerationAtUtc)],
              [
                'Último mes generado',
                info.lastGeneratedMonth ? formatMonth(info.lastGeneratedMonth) : 'Sin información',
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted">{label}</dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted">
            Fechas en horario de Monterrey.{' '}
            {state.statusScope === 'CurrentInstance'
              ? 'Las comprobaciones y generaciones corresponden solo a esta instancia; se reinician al reiniciar el proceso. No son un historial global.'
              : 'El servidor no informó un alcance operativo reconocido.'}
          </p>
          {info.error && (
            <p role="alert" className="rounded-xl bg-warning-soft p-3 text-sm text-warning">
              {info.error}
            </p>
          )}
        </section>
        {save.error && !dialog && <ErrorState message={save.error} />}
        {conflict && (
          <p role="alert" className="rounded-xl bg-warning-soft p-4 text-sm text-warning">
            No se guardaron los cambios: la versión o las convocatorias entraron en conflicto. Tu
            borrador sigue visible. Recarga el estado guardado y revisa de nuevo antes de guardar;
            la recarga descartará este borrador.
          </p>
        )}
        <div className="surface-panel space-y-4 p-5 sm:p-6">
          <p className="text-sm leading-6 text-muted">
            Los cambios generales solo se aplican a convocatorias que todavía no existen, incluidos
            meses pendientes. No reprograman las existentes. Pausar la automatización no cierra los
            periodos ya guardados.
          </p>
          <p role="status" className="text-sm font-semibold">
            {dirty
              ? 'Tienes cambios sin guardar. Guárdalos antes de salir de esta pantalla.'
              : 'Sin cambios pendientes.'}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="secondary" disabled={busy} onClick={refresh}>
              <Icon name="refresh" />
              Recargar estado guardado
            </button>
            <button
              type="submit"
              className="primary"
              disabled={busy || !dirty || conflict || (enabled && state.legacyScheduleDetected)}
            >
              {save.busy ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={dialog === 'save'}
        title="Guardar calendario mensual"
        description={`${enabled ? 'Se solicitará activar' : 'Se pausará'} la automatización administrativa con estos horarios. Las convocatorias existentes no cambiarán.${!state.technicalEnabled ? ' El permiso técnico está bloqueado: guardar no habilita la ejecución en Azure.' : ''}`}
        busy={save.busy}
        error={save.error}
        onCancel={() => {
          setDialog(null)
          save.clearError()
        }}
        onConfirm={() => {
          void save.run(confirmSave)
        }}
        confirmLabel="Confirmar y guardar"
      />
      <ConfirmDialog
        open={dialog === 'reload'}
        title="Descartar cambios y recargar"
        description="Se descartará el borrador visible y se consultará la configuración guardada en el servidor."
        confirmLabel="Descartar y recargar"
        onCancel={() => setDialog(null)}
        onConfirm={onReload}
      />
    </>
  )
}
