import type { AutomationCalendar } from './types'
export const emptyCalendar: AutomationCalendar = {
  nominationOpeningDayOffset: null,
  nominationOpeningLocalTime: null,
  nominationClosingDayOffset: null,
  nominationClosingLocalTime: null,
  opinionOpeningDayOffset: null,
  opinionOpeningLocalTime: null,
  opinionClosingDayOffset: null,
  opinionClosingLocalTime: null,
}
export const periods = [
  {
    prefix: 'nomination',
    title: 'Postulaciones',
    description: 'Periodo para registrar las postulaciones de colaboradores.',
  },
  {
    prefix: 'opinion',
    title: 'Opiniones departamentales',
    description: 'RH, Seguridad y Calidad comparten este único periodo.',
  },
] as const
export function calendarError(calendar: AutomationCalendar): string | null {
  for (const { prefix, title } of periods) {
    const openingDay = calendar[`${prefix}OpeningDayOffset`]
    const closingDay = calendar[`${prefix}ClosingDayOffset`]
    const openingTime = calendar[`${prefix}OpeningLocalTime`]
    const closingTime = calendar[`${prefix}ClosingLocalTime`]
    if (
      [openingDay, closingDay].some(
        (day) => day === null || !Number.isInteger(day) || day < -31 || day > 365,
      )
    )
      return `${title}: indica días enteros de -31 a 365.`
    if (
      !openingTime ||
      !closingTime ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(openingTime) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(closingTime)
    )
      return `${title}: completa las horas de apertura y cierre.`
    if (openingDay! > closingDay! || (openingDay === closingDay && openingTime >= closingTime))
      return `${title}: el cierre debe ser posterior a la apertura.`
  }
  return null
}
export function relativeDayHint(day: number | null): string {
  if (day === null || !Number.isInteger(day))
    return 'De -31 a 365 días; usa un valor negativo para anticipar la fecha.'
  if (day < 0) return `${Math.abs(day)} día(s) antes del primer día del mes siguiente al evaluado.`
  if (day === 0) return 'Primer día del mes siguiente al evaluado.'
  return `${day} día(s) después del primer día del mes siguiente al evaluado.`
}
const monterrey = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Monterrey',
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
})
export function plantDate(value: string | null) {
  if (!value) return 'Sin información'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha no válida' : monterrey.format(date)
}
