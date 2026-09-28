import type { ReactNode } from 'react'

import type { ShipmentView } from '../../types'

export interface ShipmentLifecycleCardProps {
  shipment: ShipmentView
  /**
   * Acción sobre el envío, a la derecha del título: «Despachar» cuando quedó
   * pendiente (TESIS-134). La decide la página; la tarjeta sólo la ubica.
   */
  action?: ReactNode
}
