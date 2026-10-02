import type { CreateTransferPayload, Product, Warehouse } from '../../types'

export interface TransferStockModalProps {
  open: boolean
  product: Product
  /** Todos los depósitos de la empresa: el destino puede no tener stock del producto. */
  warehouses: Warehouse[]
  submitting?: boolean
  /** Mensaje del rechazo de la API, ya traducido. Se muestra dentro del modal. */
  error?: string
  onSubmit: (payload: CreateTransferPayload) => void
  onClose: () => void
}
