const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
const month = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' })
export function formatDate(value: string | null): string {
  if (!value) return 'Sin configurar'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha no válida' : dateTime.format(date)
}
export function formatMonth(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha no válida' : month.format(date)
}
