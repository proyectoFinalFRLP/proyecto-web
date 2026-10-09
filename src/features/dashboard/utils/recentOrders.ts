import type { StatusVariant } from 'shared/components'

import { dashboardCopy } from '../content'
import type { OrderStatus } from '../types'

// Formato y vocabulario de la tabla de órdenes recientes del panel.
//
// El importe y las unidades salen de `shared/utils`: eran la misma cuenta que
// en `features/orders/utils`, y una feature no puede importar de otra
// (architecture.md §3.2). Converger las dos copias era la card de seguimiento
// que ese comentario anunciaba, y es TESIS-166. Las etiquetas de estado siguen
// repetidas a propósito: son vocabulario de pantalla, no formato.

const DATE = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

// `hourCycle: 'h23'` y no `hour12: false`: en es-AR el segundo deja el reloj en
// el ciclo h24 y la medianoche sale como «24:14» en vez de «00:14».
const TIME = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// Mapa explícito y no un `switch` con default: si el backend suma un estado, el
// compilador marca este archivo en vez de pintarlo en gris sin avisar.
const VARIANTS: Record<OrderStatus, StatusVariant> = {
  pending: 'neutral',
  paid: 'success',
  cancelled: 'error',
}

const LABELS: Record<OrderStatus, string> = {
  pending: dashboardCopy.recentOrders.status.pending,
  paid: dashboardCopy.recentOrders.status.paid,
  cancelled: dashboardCopy.recentOrders.status.cancelled,
}

export function statusVariant(status: OrderStatus): StatusVariant {
  return VARIANTS[status]
}

export function statusLabel(status: OrderStatus): string {
  return LABELS[status]
}

/** "24 ago" — la línea principal de la columna de fecha, sin año como el diseño. */
export function formatShortDate(iso: string): string {
  return DATE.format(new Date(iso))
}

/** "09:14" — la línea secundaria, en 24 horas. */
export function formatTime(iso: string): string {
  return TIME.format(new Date(iso))
}

/**
 * Lo que se muestra en la columna «ID de orden».
 *
 * Se prefiere el identificador del canal externo, que es con el que el operador
 * conoce la venta. Las ventas cargadas a mano no tienen uno, y ahí se cae al id
 * interno para que la columna nunca quede vacía: es la que abre el detalle.
 */
export function formatOrderId(externalOrderId: string | null, id: number): string {
  return `#${externalOrderId ?? id}`
}
