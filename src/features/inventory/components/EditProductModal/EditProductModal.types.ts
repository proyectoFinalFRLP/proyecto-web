import type { ReactNode } from 'react'

import type { Product, UpdateProductPayload, Warehouse } from '../../types'
import type { ConflictChange } from '../../utils/conflict'

/**
 * Qué deja editar el modal.
 *
 * `product` es el formulario completo. `stock` muestra **sólo** las cantidades
 * por depósito: el botón «Editar stock» del detalle abría el formulario entero
 * —nombre, peso, dimensiones y de paso el stock— y la auditoría del 04/10 lo
 * marcó, porque el botón promete una cosa y hace otra.
 *
 * Es un alcance del mismo modal y no un componente aparte a propósito: el
 * guardado, el `If-Match` y el 412 (TESIS-101) son los mismos, y duplicarlos
 * sería tener dos versiones de la parte delicada.
 */
export type EditScope = 'product' | 'stock'

export interface EditProductModalProps {
  /** Por defecto, el formulario completo. */
  scope?: EditScope
  open: boolean
  /** Producto a editar. Sus valores pre-pueblan el formulario al abrir. */
  product: Product
  /** Depósitos de la empresa — alimentan el botón "Agregar depósito". */
  warehouses: Warehouse[]
  /** Vocabulario de categorías (`GET /products/categories`). */
  categories?: string[]
  /** Recibe el cuerpo ya armado para `PUT /api/v1/products/:id`. */
  onSubmit: (payload: UpdateProductPayload) => void
  onClose: () => void
  /** Deja el modal en espera mientras la mutación está en vuelo. */
  submitting?: boolean
  /**
   * Conflicto de versión (412): el producto cambió desde que se abrió el modal.
   * Lista qué se modificó. El modal NO se cierra ni pierde lo cargado — el
   * usuario decide si pisa igual.
   *
   * Mientras esté presente, el botón de guardar se rotula «Guardar de todos
   * modos»: la acción es la misma de siempre —mandar el formulario tal como
   * está— pero ahora pisa el trabajo de otra persona, y eso se nombra.
   */
  conflict?: ConflictChange[]
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
