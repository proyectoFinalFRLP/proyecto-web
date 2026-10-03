import type { OrderDetail, Shipment } from '../../types'

export interface DeliveryNoteProps {
  order: OrderDetail
  /** Identificador visible de la orden («#ORD-8829-X»). */
  orderLabel: string
  /** La empresa que emite el remito: el tenant de la sesión. */
  companyName: string
  /** El envío de la orden, si ya existe: aporta courier y número de seguimiento. */
  shipment: Shipment | null
  /** Se cerró el diálogo de impresión: quien lo montó lo desmonta. */
  onPrinted: () => void
}
