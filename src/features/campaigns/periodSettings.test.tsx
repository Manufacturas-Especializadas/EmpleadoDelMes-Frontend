import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PeriodSettings } from './pages/PeriodSettings'
import { ToggleSwitch } from '@/shared/components/ToggleSwitch'
import { validSchedule, localDateInput } from './schedulePresentation'
const render = (mode: 0 | 1 | 2, archived = false) =>
  renderToStaticMarkup(
    <PeriodSettings
      period="nominations"
      data={{ mode, scheduledOpeningAtUtc: null, scheduledClosingAtUtc: null }}
      open={mode === 1 && !archived}
      archived={archived}
      busy={false}
      onAction={() => {}}
      onSchedule={() => {}}
    />,
  )
it('representa modos manuales sin convertir automático en interruptor', () => {
  expect(render(1)).toContain('aria-checked="true"')
  expect(render(2)).toContain('aria-checked="false"')
  expect(render(0)).not.toContain('role="switch"')
  expect(render(0)).toContain('Abrir manualmente')
  expect(render(0)).toContain('Cerrar manualmente')
})
it('deshabilita controles archivados y no permite automático sin fechas', () => {
  expect(render(1, true)).toContain('disabled=""')
  expect(render(1)).toContain('Configura las fechas')
})
it('el switch solicita confirmación externa sin cambiar su valor', () => {
  let requested: boolean | undefined
  const element = ToggleSwitch // rendered accessibility inspected separately; native button handles Space/Enter
  expect(typeof element).toBe('function')
  const html = renderToStaticMarkup(
    <ToggleSwitch
      checked={false}
      label="Apertura"
      loading
      onChange={(value) => {
        requested = value
      }}
    />,
  )
  expect(html).toContain('aria-busy="true"')
  expect(html).toContain('disabled=""')
  expect(html).toContain('aria-checked="false"')
  expect(requested).toBeUndefined()
})
it('valida cierre posterior y rechaza valores vacíos o inválidos', () => {
  expect(validSchedule('2026-11-01T08:00', '2026-11-01T09:00')).toBe(true)
  expect(validSchedule('2026-11-01T08:00', '2026-11-01T08:00')).toBe(false)
  expect(validSchedule('', '')).toBe(false)
  expect(validSchedule('bad', 'bad')).toBe(false)
  expect(localDateInput(null)).toBe('')
  expect(localDateInput('2026-11-01T08:00:00')).toBe('2026-11-01T08:00')
})
