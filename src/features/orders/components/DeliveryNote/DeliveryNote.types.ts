import type { OrderDetail } from '../../types'

export interface DeliveryNoteProps {
  order: OrderDetail
  /** «#1001»: la orden ya nombrada con `formatOrderId`. */
  orderLabel: string
  /** El nombre de la empresa que emite el remito; sin él, el remito no lo inventa. */
  companyName?: string
  /** Cuándo se emite: la fecha del día de la impresión, en ISO. */
  issuedAt: string
}
