import type { StatusVariant } from 'shared/components'

import { dashboardCopy } from '../content'
import type { OrderStatus } from '../types'

// Formato y vocabulario de la tabla de órdenes recientes del panel.
//
// Sí, esto también existe en `features/orders/utils`. No se importa de ahí
// porque una feature no puede depender de otra (architecture.md §3.2), y no se
// sube a `shared/` en esta card por una razón concreta: TESIS-61 está
// reescribiendo esos archivos en paralelo, y moverlos ahora garantiza un
// conflicto en el trabajo de otro. Cuando esa card entre, converger las dos
// copias es una card de seguimiento — hasta entonces, las etiquetas de estado
// son las mismas de los dos lados a propósito y este comentario es el recordatorio.

const MONEY = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

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

/**
 * Importe de la orden, con dos decimales siempre.
 *
 * El criterio de finalización de la card es exactamente éste: la columna es
 * plata facturada, y redondear $ 1.478.300,49 a $ 1.478.300 en pantalla es
 * mostrar un número que no es el de la orden.
 */
export function formatMoney(amount: number): string {
  return MONEY.format(amount)
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
