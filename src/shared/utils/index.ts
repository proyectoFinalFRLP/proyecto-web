export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  return new Intl.DateTimeFormat('es-AR', options).format(new Date(date))
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isNonEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

// Formateo relativo ("hace 2 minutos") vía Intl, mismo criterio que `formatDate`:
// el locale y las reglas de plural las resuelve la plataforma, no nosotros.
const RELATIVE_TIME_FORMAT = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' })

// Umbrales de mayor a menor: se elige la primera unidad que "entra" en el lapso.
const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
]

export function formatRelativeTime(date: string | Date, now: number = Date.now()): string {
  // Negativo = pasado. Intl ya lo traduce a "hace N …" sin que armemos el string.
  const elapsedSeconds = (new Date(date).getTime() - now) / 1000
  const match = RELATIVE_TIME_UNITS.find(({ seconds }) => Math.abs(elapsedSeconds) >= seconds)

  if (!match) return RELATIVE_TIME_FORMAT.format(Math.round(elapsedSeconds), 'second')

  return RELATIVE_TIME_FORMAT.format(Math.round(elapsedSeconds / match.seconds), match.unit)
}
