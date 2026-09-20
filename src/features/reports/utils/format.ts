// Formato de los números de la pantalla de reportes. Locale fijo `es-AR`, como
// el resto de la app. Viven acá y no en los componentes para probarse solos.

const INTEGER = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
const ONE_DECIMAL = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })

const THOUSAND = 1_000
const MILLION = 1_000_000

/** «124.592» — unidades enteras con separador de miles. */
export function formatInteger(value: number): string {
  return INTEGER.format(value)
}

/**
 * Cifra abreviada para tarjetas y ejes: «850», «7,5k», «4,2 MM».
 *
 * `k` y `MM` en vez de la notación compacta de `Intl` («7,5 mil», «4,2 M»):
 * son las abreviaturas del diseño y las que usa la operación para hablar de
 * millones de pesos. Un decimal como máximo: en un eje o en una tarjeta el
 * número se lee de un vistazo, no se audita.
 */
export function formatCompact(value: number): string {
  const magnitude = Math.abs(value)
  if (magnitude >= MILLION) return `${ONE_DECIMAL.format(value / MILLION)} MM`
  if (magnitude >= THOUSAND) return `${ONE_DECIMAL.format(value / THOUSAND)}k`
  return INTEGER.format(value)
}

/** «$4,2 MM» — importe abreviado, pegado al símbolo como en el diseño. */
export function formatCompactMoney(value: number): string {
  return `$${formatCompact(value)}`
}

/** «98,2%» — una tasa 0-100 con un decimal como máximo. */
export function formatPercent(rate: number): string {
  return `${ONE_DECIMAL.format(rate)}%`
}

/** «4.200 u» — el volumen impactado de una anomalía, en unidades. */
export function formatUnits(value: number): string {
  return `${formatInteger(value)} u`
}
