import type { DataTablePagination, DataTableTab } from 'shared/components'

import type { ShipmentSummary } from '../../types'

export interface ShipmentsTableProps {
  shipments: ShipmentSummary[]
  tabs: DataTableTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  pagination: DataTablePagination
  /** Abre la orden del envío: su detalle vive ahí, no en una pantalla propia. */
  onView: (shipment: ShipmentSummary) => void
}
