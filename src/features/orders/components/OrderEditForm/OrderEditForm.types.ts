import type { OrderDetail, OrderShipment } from '../../types'

export interface OrderEditFormProps {
  order: OrderDetail
  /** "ORD-8829-X" o "#8829": cómo la pantalla nombra la orden. */
  orderLabel: string
  /** El envío de la orden; `undefined` mientras carga o si no se pudo leer. */
  shipment: OrderShipment | undefined
  ordersPath: string
  detailPath: string
  /** Vuelve a pedir la orden, para después de un 412. */
  onReload: () => void
}
