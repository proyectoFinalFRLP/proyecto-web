// Formateo de fechas del listado de envíos. Locale fijo `es-AR`, mismo criterio
// que el resto del producto: la app está entera en español y no hay i18n.
//
// Propio y no importado de `features/orders`: una feature no importa de otra
// (architecture.md §3.2). Si apareciera un tercer consumidor, el par sube a
// `shared/utils` por la Regla de Dos.

const DATE = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' })
const TIME = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })

/** "24 ago" — la línea principal de la celda de fecha. */
export function formatShipmentDate(iso: string): string {
  return DATE.format(new Date(iso))
}

/** "09:14" — la línea secundaria, en 24 horas. */
export function formatShipmentTime(iso: string): string {
  return TIME.format(new Date(iso))
}
