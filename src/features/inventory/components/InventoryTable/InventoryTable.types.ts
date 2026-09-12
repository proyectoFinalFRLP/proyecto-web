import type { DataTablePagination, DataTableTab } from 'shared/components'

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
}
