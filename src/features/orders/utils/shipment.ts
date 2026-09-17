import type { StatusVariant } from 'shared/components'

import { ordersCopy } from '../content'
import type { OrderShipment, OrderStatus, Shipment, ShipmentStatus } from '../types'

import { statusLabel, statusVariant } from './status'

// Reglas del ciclo de vida del envío que muestra el detalle de la orden. Viven
// acá y no en los componentes para poder probarlas sin montar la pantalla.

/** Las etapas del ciclo, en orden. Es el mismo vocabulario que `Shipment::STATUSES`. */
export const SHIPMENT_STAGES: readonly ShipmentStatus[] = [
  'pending',
  'ready_to_ship',
  'in_transit',
  'delivered',
]

// Mapas explícitos por el mismo motivo que en `status.ts`: si el backend suma
// un estado, el compilador marca este archivo.
const VARIANTS: Record<ShipmentStatus, StatusVariant> = {
  pending: 'neutral',
  ready_to_ship: 'info',
  in_transit: 'info',
  delivered: 'success',
}

const LABELS: Record<ShipmentStatus, string> = ordersCopy.shipmentStatus

export function shipmentStatusLabel(status: ShipmentStatus): string {
  return LABELS[status]
}

export function shipmentStatusVariant(status: ShipmentStatus): StatusVariant {
  return VARIANTS[status]
}

export interface HeaderStatus {
  label: string
  variant: StatusVariant
}

/**
 * El badge principal del encabezado.
 *
 * La card lo pide basado en el estado del envío, con dos excepciones:
 *
 * · Una orden cancelada muestra «Cancelada» aunque tenga envío. Es lo único
 *   que importa de ella, y un «En tránsito» al lado diría lo contrario.
 * · Mientras el envío no resolvió (o no se pudo leer) se muestra el estado de
 *   la orden, que ya está: un badge vacío hace saltar el título.
 */
export function headerStatus(
  orderStatus: OrderStatus,
  shipment: OrderShipment | undefined,
): HeaderStatus {
  if (orderStatus === 'cancelled' || shipment === undefined) {
    return { label: statusLabel(orderStatus), variant: statusVariant(orderStatus) }
  }

  switch (shipment.kind) {
    case 'none':
      return { label: ordersCopy.detail.header.noShipment, variant: 'neutral' }
    case 'duplicated':
      return { label: ordersCopy.detail.header.duplicatedShipment, variant: 'warning' }
    case 'single':
      return {
        label: shipmentStatusLabel(shipment.shipment.status),
        variant: shipmentStatusVariant(shipment.shipment.status),
      }
  }
}

export type StageState = 'done' | 'current' | 'pending'

export interface LifecycleStage {
  status: ShipmentStatus
  state: StageState
  /** Cuándo el envío llegó a esta etapa, o null si todavía no llegó. */
  reachedAt: string | null
}

/**
 * Las cuatro etapas del ciclo con su estado y su fecha.
 *
 * La etapa vigente es la del `status` del envío, no la del último evento: el
 * status es lo que el backend considera verdad, y un evento puede llegar
 * desordenado. La fecha de cada etapa es la del **primer** evento que la
 * reporta, que es cuando el envío entró en ella; los reintentos del courier
 * repiten el estado y no la mueven.
 *
 * Una vez entregado no queda nada por hacer: la última etapa se marca como
 * completa y no como vigente.
 */
export function buildLifecycle(shipment: Shipment): LifecycleStage[] {
  const currentIndex = SHIPMENT_STAGES.indexOf(shipment.status)
  const finished = shipment.status === 'delivered'

  return SHIPMENT_STAGES.map((status, index) => {
    const firstEvent = shipment.events.find((event) => event.internalStatus === status)

    let state: StageState = 'pending'
    if (index < currentIndex || (finished && index === currentIndex)) state = 'done'
    else if (index === currentIndex) state = 'current'

    return { status, state, reachedAt: firstEvent?.occurredAt ?? null }
  })
}

/**
 * Avance del ciclo, 0-100: cuántas etapas quedaron atrás sobre las que hay que
 * recorrer. Recién creado es 0 y entregado es 100.
 */
export function lifecycleProgress(status: ShipmentStatus): number {
  const index = SHIPMENT_STAGES.indexOf(status)

  return Math.round((index / (SHIPMENT_STAGES.length - 1)) * 100)
}

/**
 * La entrega, para la métrica del encabezado.
 *
 * La card la pide «extraída del último evento programado», pero la bitácora
 * sólo registra lo que ya pasó (`occurred_at`) y ningún endpoint expone una
 * fecha comprometida. Lo único cierto es la fecha de entrega de un envío que
 * ya llegó; antes de eso no hay estimación que mostrar, y se dice así en lugar
 * de inventar una.
 */
export function deliveredAt(shipment: Shipment): string | null {
  if (shipment.status !== 'delivered') return null

  return shipment.events.find((event) => event.internalStatus === 'delivered')?.occurredAt ?? null
}

/**
 * La bitácora para el feed, de la más reciente a la más vieja: lo último que
 * pasó es lo primero que se busca. La API la entrega en orden cronológico.
 */
export function eventsNewestFirst(shipment: Shipment): Shipment['events'] {
  return [...shipment.events].reverse()
}
