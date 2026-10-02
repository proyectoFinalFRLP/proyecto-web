import type { Product, Warehouse } from '../../types'

export interface ProductTransfersProps {
  product: Product
  /** Todos los depósitos de la empresa, para el destino de una transferencia nueva. */
  warehouses: Warehouse[]
}
