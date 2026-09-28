import type { OrderLine, OriginWarehouse } from '../../types'

export interface DispatchShipmentDialogProps {
  open: boolean
  orderId: number
  /** "#8829", como lo muestra el encabezado del detalle. */
  orderLabel: string
  /** El envío `pending` que se despacha. */
  shipmentId: number
  /** De las líneas sale el depósito de origen: el envío no lo guarda. */
  lines: OrderLine[]
  onClose: () => void
  /** Después de un despacho exitoso, con el operador que lo emitió. */
  onDispatched: (carrier: string) => void
}

export interface OriginOptionsProps {
  warehouses: OriginWarehouse[]
  selectedId: number | null
  onSelect: (warehouse: OriginWarehouse) => void
  disabled?: boolean
}
