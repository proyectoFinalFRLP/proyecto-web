import type { OrderLine, OrderStatus, OriginWarehouse, Shipment, ShipmentView } from '../types'

// Las reglas del despacho desde el detalle de la orden (TESIS-134), fuera de los
// componentes para probarlas sin montar la pantalla: cuándo se ofrece, de qué
// depósito sale y qué se cotiza.

/**
 * El envío que se puede despachar desde el detalle, o null si no hay ninguno.
 *
 * Es la misma regla que aplica el backend antes de pedir la etiqueta
 * (`Shipments::ConfirmDispatch#validate_status!`): el envío está `pending` y
 * todavía no tiene número de seguimiento. Un envío que ya salió no se vuelve a
 * despachar, y uno que se devolvió a `pending` a mano conserva su número.
 *
 * Una orden cancelada tampoco lo ofrece, aunque el backend no lo rechace: el
 * alta del envío sí las excluye (`Shipments::CreateShipment`), y emitir la
 * etiqueta de una venta que no va a salir sería pagar un despacho de más.
 */
export function dispatchableShipment(
  orderStatus: OrderStatus,
  view: ShipmentView,
): Shipment | null {
  if (orderStatus === 'cancelled' || view.kind !== 'single') return null

  const { shipment } = view
  return shipment.status === 'pending' && shipment.trackingNumber === null ? shipment : null
}

/**
 * Los depósitos desde los que puede salir el envío.
 *
 * El envío no guarda su origen, pero cada línea sabe de qué depósito se
 * descontó (TESIS-126), y el despacho tiene que salir de ahí. El alta manual
 * usa uno solo, así que lo normal es un único candidato y la pantalla no
 * pregunta. Si las líneas salieron de más de uno —una modificación puede sumar
 * líneas de otro—, elige el operador.
 *
 * Sin ninguna línea que lo sepa (las anteriores a TESIS-126 y las que entran por
 * webhook), no hay de dónde deducirlo y se ofrecen todos. Tampoco se deduce de
 * un depósito que ya no está entre los de la empresa.
 */
export function originCandidates(
  lines: OrderLine[],
  warehouses: OriginWarehouse[],
): OriginWarehouse[] {
  const fromLines = new Set(lines.flatMap((line) => line.warehouseId ?? []))
  const known = warehouses.filter((warehouse) => fromLines.has(warehouse.id))

  return known.length === 0 ? warehouses : known
}

/** Lo que manda el detalle a `POST /api/v1/orders/:id/quotes` (TESIS-46). */
export interface OrderQuotePayload {
  quote: { origin_warehouse_id: number }
}

/**
 * La cotización de una orden que ya existe. Sólo viaja el origen: el destino y
 * lo que lleva el paquete el backend los lee de la orden.
 */
export function toOrderQuotePayload(originWarehouseId: number): OrderQuotePayload {
  return { quote: { origin_warehouse_id: originWarehouseId } }
}
