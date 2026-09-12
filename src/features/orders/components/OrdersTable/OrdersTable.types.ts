import type { DataTablePagination, DataTableTab } from 'shared/components'

import type { OrderSummary } from '../../types'

export interface OrdersTableProps {
  orders: OrderSummary[]
  tabs: DataTableTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  pagination: DataTablePagination
  /** Abre el detalle. Lo disparan tanto el ID de la fila como "Ver". */
  onView: (order: OrderSummary) => void
  onEdit: (order: OrderSummary) => void
}
