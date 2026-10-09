// Formateo de números del detalle de producto. Locale fijo `es-AR` — el mismo
// criterio de `shared/utils/formatDate`: la app está entera en español (ver el
// vocabulario del producto en `docs/design/README.md`) y todavía no hay i18n.
//
// El diseño escribe los enteros con punto de miles ("4.280") y los decimales
// con coma ("1,45 kg"): las dos formas salen de acá y de ningún otro lado.

import { formatDate } from 'shared/utils'

/**
 * Marca temporal de la ficha: `"24 ago 2026 · 09:14"`.
 *
 * `formatDate` de `shared/utils` resuelve la parte de fecha; la hora va aparte
 * porque el diseño las separa con un punto medio y no con la coma que mete
 * `dateStyle`/`timeStyle` juntos.
 */
export function formatSpecTimestamp(isoDate: string): string | null {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return null

  const date = formatDate(parsed, { day: 'numeric', month: 'short', year: 'numeric' })
  const time = formatDate(parsed, { hour: '2-digit', minute: '2-digit' })

  return `${date} · ${time}`
}
