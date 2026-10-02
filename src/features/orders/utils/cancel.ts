import type { OrderStatus, ShipmentView } from '../types'

/**
 * Si la orden se puede cancelar desde el detalle. Es la regla de
 * `Orders::CancelOrder#ensure_cancellable!` vista desde la pantalla: no está
 * cancelada, y su envío no existe o todavía no salió (`pending` y sin número de
 * seguimiento).
 *
 * Mientras el envío carga, o si no se pudo leer, no se ofrece: no se sabe si ya
 * salió, y ofrecer algo que la API va a rechazar con 409 es prometer de más.
 * Tampoco con más de un envío, que el modelo prohíbe.
 */
export function cancellableOrder(status: OrderStatus, view: ShipmentView): boolean {
  if (status === 'cancelled') return false
  if (view.kind === 'none') return true
  if (view.kind !== 'single') return false

  return view.shipment.status === 'pending' && view.shipment.trackingNumber === null
}
