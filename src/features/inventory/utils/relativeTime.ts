// Formateo de "hace X" con `Intl.RelativeTimeFormat` — sin sumar una librería
// de fechas por un solo string del pie del modal.

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/**
 * Convierte un timestamp ISO en "hace 2 horas".
 *
 * Devuelve `null` si la fecha no es parseable: el pie del modal prefiere no
 * mostrar nada antes que mostrar "Invalid Date".
 */
export function formatRelativeTime(isoDate: string, now: Date = new Date()): string | null {
  const target = new Date(isoDate)
  if (Number.isNaN(target.getTime())) return null

  let duration = (target.getTime() - now.getTime()) / 1000

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }

  return null
}
