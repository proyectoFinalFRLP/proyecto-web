import type { DeleteBlocker, Warehouse } from '../../types'

export interface DeleteWarehouseDialogProps {
  /** El depósito a borrar; sin él, el diálogo está cerrado. */
  warehouse?: Warehouse
  deleting?: boolean
  /** Motivo del 409, si la API ya rechazó la baja. */
  blocker?: DeleteBlocker
  /** Un fallo que no es el 409 (red, 500): se puede reintentar. */
  failed?: boolean
  onConfirm: () => void
  onClose: () => void
}
