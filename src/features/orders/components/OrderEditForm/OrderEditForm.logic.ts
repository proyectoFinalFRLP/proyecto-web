import { ordersCopy } from '../../content'
import type { OrderDetail, OrderShipment } from '../../types'
import type { DestinationFormData } from '../DestinationFieldsCard'
import type { InfoField } from '../InfoPanel'
import type { OrderContextFormData } from '../OrderContextCard'

const { shipment: copy } = ordersCopy.edit

/** Por qué la orden no se puede modificar, con la misma regla que el backend. */
export type LockReason = 'cancelled' | 'dispatched'

/**
 * Una orden cancelada no se edita, y una cuyo envío ya salió tampoco: es la
 * regla de `Orders::UpdateOrder#ensure_editable!`. Un envío `pending` sin
 * número de seguimiento todavía no salió. La pantalla la aplica antes para no
 * dejar editar algo que el guardado va a rechazar con 409.
 *
 * Mientras el envío no cargó no se puede saber: se deja editar, y si salió, el
 * 409 del backend lo dice.
 */
export function lockReason(
  order: OrderDetail,
  shipment: OrderShipment | undefined,
): LockReason | null {
  if (order.status === 'cancelled') return 'cancelled'
  if (shipment?.kind !== 'single') return null

  const { status, trackingNumber } = shipment.shipment
  return status !== 'pending' || trackingNumber !== null ? 'dispatched' : null
}

export function contextDefaults(order: OrderDetail): OrderContextFormData {
  return {
    customerName: order.customerName,
    customerDocument: order.customerDocument ?? '',
    // Una orden cancelada llega bloqueada; el valor sólo tiene que ser válido.
    status: order.status === 'paid' ? 'paid' : 'pending',
  }
}

export function destinationDefaults(order: OrderDetail): DestinationFormData {
  return {
    address: order.customerAddress ?? '',
    city: order.customerCity ?? '',
    province: order.customerProvince ?? '',
    zipCode: order.customerZipCode ?? '',
  }
}

/** El operador y el seguimiento, de sólo lectura: se asignan al despachar. */
export function shipmentFields(shipment: OrderShipment | undefined): InfoField[] {
  const single = shipment?.kind === 'single' ? shipment.shipment : null
  const carrier = single?.courier?.name ?? null
  const tracking = single?.trackingNumber ?? null

  return [
    {
      id: 'carrier',
      label: copy.fields.carrier,
      value: carrier ?? copy.noCarrier,
      unknown: carrier === null,
    },
    {
      id: 'tracking',
      label: copy.fields.tracking,
      value: tracking ?? copy.noTracking,
      mono: tracking !== null,
      unknown: tracking === null,
    },
  ]
}
