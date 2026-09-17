import type { StatusVariant } from 'shared/components'

export interface OrderDetailHeaderProps {
  /** Identificador visible de la orden ("#ORD-8829-X"): título y último tramo del breadcrumb. */
  orderLabel: string
  /** Texto del badge principal, ya resuelto por quien monta el header. */
  statusLabel: string
  statusVariant: StatusVariant
  /** Ruta del listado, para el tramo navegable del breadcrumb. */
  ordersPath: string
  /** «Modificar orden». */
  onModify: () => void
}
