import type { DataTablePagination, DataTableSort, DataTableTab } from 'shared/components'

import type { ProductSummary } from '../../types'

export interface InventoryTableProps {
  products: ProductSummary[]
  tabs: DataTableTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  pagination: DataTablePagination
  /** Abre el detalle. Lo disparan tanto el SKU de la fila como "Ver". */
  onView: (product: ProductSummary) => void
  onEdit: (product: ProductSummary) => void
  /** Pide confirmación antes de borrar: la baja no se puede deshacer. */
  onDelete: (product: ProductSummary) => void
  /** El orden activo de la tabla (TESIS-184). Lo resuelve la API. */
  sort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort) => void
}
