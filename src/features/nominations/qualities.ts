export const qualities = [
  { value: 1, label: 'Trabajo en equipo' },
  { value: 2, label: 'Resolución de problemas' },
  { value: 4, label: 'Compromiso' },
  { value: 8, label: 'Iniciativa' },
]
export function qualityLabels(value: number) {
  return qualities
    .filter((item) => (value & item.value) !== 0)
    .map((item) => item.label)
    .join(', ')
}
