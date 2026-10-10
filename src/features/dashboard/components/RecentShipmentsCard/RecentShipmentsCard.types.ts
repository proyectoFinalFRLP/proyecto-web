import type { DispatchedShipment } from '../../types'

export interface RecentShipmentsCardProps {
  /** Los últimos envíos, en el orden que los devuelve la API. */
  shipments: DispatchedShipment[]
  /** Muestra filas fantasma mientras llega la respuesta. */
  loading?: boolean
}
