import type { ReactNode } from 'react'

import type { Product, UpdateProductPayload, Warehouse } from '../../types'

export interface EditProductModalProps {
  open: boolean
  /** Producto a editar. Sus valores pre-pueblan el formulario al abrir. */
  product: Product
  /** Depósitos de la empresa — alimentan el botón "Agregar depósito". */
  warehouses: Warehouse[]
  /** Recibe el cuerpo ya armado para `PUT /api/v1/products/:id`. */
  onSubmit: (payload: UpdateProductPayload) => void
  onClose: () => void
  /** Deja el modal en espera mientras la mutación está en vuelo. */
  submitting?: boolean
}

export interface SectionHeadingProps {
  title: string
  /** Acción alineada a la derecha del título (ej. "Agregar depósito"). */
  action?: ReactNode
}

export interface WarehouseStockFieldProps {
  name: string
  address: string
  quantityLabel: string
  removeLabel: string
  error?: string
  onRemove: () => void
  /** Props de `register()` de React Hook Form para el input de cantidad. */
  children: ReactNode
}
