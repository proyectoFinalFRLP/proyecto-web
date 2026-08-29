import type { ReactNode } from 'react'

import type { CreateProductPayload, Warehouse } from '../../types'

export interface CreateProductModalProps {
  open: boolean
  /** Depósitos de la empresa — alimentan los selectores de cada fila. */
  warehouses: Warehouse[]
  /** Recibe el cuerpo ya armado para `POST /api/v1/products`. */
  onSubmit: (payload: CreateProductPayload) => void
  onClose: () => void
  /** Deja el modal en espera mientras la mutación está en vuelo. */
  submitting?: boolean
  /**
   * Error del servidor a mostrar sin cerrar el modal. Un SKU repetido vuelve
   * como 409 y se resalta sobre el campo de SKU.
   */
  submitError?: string
}

export interface SectionHeadingProps {
  icon: ReactNode
  title: string
  /** Acción alineada a la derecha del título (ej. "Agregar depósito"). */
  action?: ReactNode
}

export interface StockRowFieldProps {
  warehouseLabel: string
  quantityLabel: string
  /** Control de selección del depósito. */
  warehouseField: ReactNode
  /** Control de cantidad. */
  quantityField: ReactNode
  warehouseError?: string
  quantityError?: string
  /** Ausente en la primera fila: siempre queda al menos una. */
  onRemove?: () => void
  removeLabel?: string
}
