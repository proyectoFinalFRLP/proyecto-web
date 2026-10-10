import { useQuery } from '@tanstack/react-query'

import { fetchRecentShipments, RECENT_SHIPMENTS } from '../api'
import { shipmentKeys } from '../queryKeys'
import type { DispatchedShipment } from '../types'

export interface RecentShipmentsState {
  shipments: DispatchedShipment[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Los últimos envíos que muestra el panel (TESIS-163).
 *
 * Reemplaza a la tarjeta de Integraciones, que mostraba la salud de los nodos.
 * Mismo criterio que `useRecentOrders`: consulta propia y no una porción del
 * listado, porque «los últimos cinco» y «la página N filtrada» son dos
 * preguntas distintas y compartir la caché las mezclaría.
 */
export function useRecentShipments(): RecentShipmentsState {
  const query = useQuery<DispatchedShipment[]>({
    queryKey: shipmentKeys.recent(RECENT_SHIPMENTS),
    queryFn: fetchRecentShipments,
  })

  const { refetch } = query

  return {
    shipments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    // Envuelto por lo mismo que en los otros hooks del panel: el `refetch` de
    // React Query recibe opciones, y cablearlo a un `onClick` le pasaría el
    // MouseEvent como opciones.
    refetch: () => void refetch(),
  }
}
