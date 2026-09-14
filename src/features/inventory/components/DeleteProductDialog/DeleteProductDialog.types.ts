import type { ProductSummary } from '../../types'

export interface DeleteProductDialogProps {
  /** El producto a dar de baja. `undefined` mantiene el diálogo cerrado. */
  product?: ProductSummary
  /** Deja el diálogo en espera mientras la baja está en vuelo. */
  deleting?: boolean
  /** El backend rechazó el borrado (409): el producto tiene historia. */
  blocked?: boolean
  onConfirm: () => void
  onClose: () => void
}
