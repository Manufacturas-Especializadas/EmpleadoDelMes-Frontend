export function validSchedule(opening: string, closing: string) {
  const start = new Date(opening).getTime(),
    end = new Date(closing).getTime()
  return Number.isFinite(start) && Number.isFinite(end) && end > start
}
export function localDateInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const part = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`
}
