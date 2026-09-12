import type { DataTableRowTone, StatusVariant } from 'shared/components'

import { ordersCopy } from '../content'
import type { OrderStatus } from '../types'

// Traducción del estado del backend a lo que la pantalla muestra. Es un mapa
// explícito y no un `switch` con default: si el backend suma un estado, el
// compilador marca este archivo en vez de pintarlo en gris sin avisar.

const VARIANTS: Record<OrderStatus, StatusVariant> = {
  pending: 'neutral',
  paid: 'success',
  cancelled: 'error',
}

const LABELS: Record<OrderStatus, string> = {
  pending: ordersCopy.status.pending,
  paid: ordersCopy.status.paid,
  cancelled: ordersCopy.status.cancelled,
}

export function statusVariant(status: OrderStatus): StatusVariant {
  return VARIANTS[status]
}

export function statusLabel(status: OrderStatus): string {
  return LABELS[status]
}

/**
 * Énfasis de la fila. Una orden cancelada se pinta con el tono de error, como
 * en el diseño: es la única que pide atención en un listado que se barre de un
 * vistazo. Las demás van neutras — atenuar las pendientes escondería justo las
 * que hay que trabajar.
 */
export function statusRowTone(status: OrderStatus): DataTableRowTone {
  return status === 'cancelled' ? 'critical' : 'default'
}
