import type { OrderDraftItem } from 'shared/store'

import type { CatalogProduct } from '../../types'

export interface ProductPickerProps {
  /** El catálogo completo; el filtro por SKU o nombre corre acá adentro. */
  products: CatalogProduct[]
  /** Mientras el catálogo viaja el buscador avisa en vez de decir "sin resultados". */
  loading?: boolean
  /** Productos que ya tienen fila: se ven pero no se pueden volver a elegir. */
  addedIds: ReadonlySet<number>
  /** La línea armada con producto, cantidad y precio unitario. */
  onAdd: (item: OrderDraftItem) => void
}
