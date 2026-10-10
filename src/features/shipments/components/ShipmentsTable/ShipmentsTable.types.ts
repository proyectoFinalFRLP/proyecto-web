import type { DataTablePagination, DataTableTab } from 'shared/components'

import type { ShipmentSummary } from '../../types'

export interface ShipmentsTableProps {
  shipments: ShipmentSummary[]
  tabs: DataTableTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  pagination: DataTablePagination
  /**
   * Qué decir con la tabla vacía. Lo elige la pantalla porque depende de si se
   * buscó algo: una pestaña sin envíos y una búsqueda sin resultados no son lo
   * mismo para quien está mirando.
   */
  emptyMessage: string
  /** Abre la orden del envío: su detalle vive ahí, no en una pantalla propia. */
  onView: (shipment: ShipmentSummary) => void
}
