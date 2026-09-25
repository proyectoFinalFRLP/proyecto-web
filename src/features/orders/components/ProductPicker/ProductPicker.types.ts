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
   * Lo que se tipeó, hacia afuera: de eso sale la consulta, y el componente no
   * decide cuándo se busca ni con qué demora. El texto del campo lo maneja MUI
   * —controlarlo desde afuera hacía que la etiqueta de la opción elegida se
   * mandara como término—.
   */
  onSearchChange: (search: string) => void
  /** La línea armada con producto, cantidad y precio unitario. */
  onAdd: (item: OrderDraftItem) => void
}
