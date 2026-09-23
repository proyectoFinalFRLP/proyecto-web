import type { OrderDraftItem } from 'shared/store'

import type { CatalogProduct } from '../../types'

export interface ProductPickerProps {
  /** Las coincidencias que devolvió el backend para `search`. */
  products: CatalogProduct[]
  /** Mientras la búsqueda viaja el buscador avisa en vez de decir "sin resultados". */
  loading?: boolean
  /** Productos que ya tienen fila: se ven pero no se pueden volver a elegir. */
  addedIds: ReadonlySet<number>
  /**
   * Lo tipeado en el buscador. Controlado desde afuera porque de eso sale la
   * consulta: el componente no decide cuándo se busca ni con qué demora.
   */
  search: string
  onSearchChange: (search: string) => void
  /** La línea armada con producto, cantidad y precio unitario. */
  onAdd: (item: OrderDraftItem) => void
}
