// Fechas de calendario de la API: `2026-10-22`, sin hora (la fecha comprometida
// de un envío, el día de una anomalía). La API ya las corta en hora de
// Argentina, así que son un día y no un instante.
//
// Se formatean en UTC a propósito: `new Date('2026-10-22')` es la medianoche
// UTC de ese día, y mostrarla en la zona del navegador la corre al 21 en
// cualquier huso al oeste de Greenwich —Argentina incluida—. Mismo criterio
// que los rótulos de la curva de Reportes.
//
// Vive en `shared` porque la usan dos features: el detalle de una orden y la
// tabla de anomalías de Reportes (Regla de Dos).

const SHORT = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** `"2026-10-22"` → `"22 oct"`, sin correr el día con la zona del navegador. */
export function formatCalendarDate(date: string): string {
  return SHORT.format(new Date(`${date}T00:00:00Z`)).replace('.', '')
}
