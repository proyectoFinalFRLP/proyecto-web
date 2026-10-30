// Formato de los números de la pantalla de reportes. Locale fijo `es-AR`, como
// el resto de la app. Viven acá y no en los componentes para probarse solos.

import { formatInteger } from 'shared/utils'

const ONE_DECIMAL = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })

const THOUSAND = 1_000
const MILLION = 1_000_000

/**
 * Cifra abreviada para tarjetas y ejes: «850», «7,5k», «4,2 M».
 *
 * `k` para miles y `M` para millones, en vez de la notación compacta de
 * `Intl` («7,5 mil», «4,2 M»): sin el rótulo largo, y sin `MM`. La doble M es
 * ambigua —la Fundéu advierte que se lee como «millones» o como «miles de
 * millones»—, y en un KPI esa duda vale 1000×: «$7,6 MM» puede leerse como
 * 7,6 millones o como 7.600 millones. `M` es además lo que `Intl` ya produce
 * con `es-AR`. Un decimal como máximo: en un eje o en una tarjeta el número
 * se lee de un vistazo, no se audita.
 */
export function formatCompact(value: number): string {
  const magnitude = Math.abs(value)
  if (magnitude >= MILLION) return `${ONE_DECIMAL.format(value / MILLION)} M`
  if (magnitude >= THOUSAND) return `${ONE_DECIMAL.format(value / THOUSAND)}k`
  return formatInteger(value)
}

/** «$4,2 M» — importe abreviado, pegado al símbolo como en el diseño. */
export function formatCompactMoney(value: number): string {
  return `$${formatCompact(value)}`
}

/** «98,2%» — una tasa 0-100 con un decimal como máximo. */
export function formatPercent(rate: number): string {
  return `${ONE_DECIMAL.format(rate)}%`
}

/** «4.200 u» — las unidades de un envío demorado. */
export function formatUnits(value: number): string {
  return `${formatInteger(value)} u`
}
