import { useQuery } from '@tanstack/react-query'

import { fetchRecentOrders, RECENT_ORDERS } from '../api'
import { orderKeys } from '../queryKeys'
import type { RecentOrder } from '../types'

export interface RecentOrdersState {
  orders: RecentOrder[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Las últimas órdenes que muestra el panel (TESIS-56).
 *
 * Consulta propia y no una porción del listado de `features/orders`: son dos
 * preguntas distintas —«las últimas cinco» contra «la página N filtrada»— y
 * compartir la caché haría que abrir el listado con un filtro cambiara lo que
 * muestra el panel.
 */
export function useRecentOrders(): RecentOrdersState {
  const query = useQuery<RecentOrder[]>({
    queryKey: orderKeys.recent(RECENT_ORDERS),
    queryFn: fetchRecentOrders,
  })

  const { refetch } = query

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    // Envuelto por lo mismo que en los otros hooks del panel: el `refetch` de
    // React Query recibe opciones, y cablearlo a un `onClick` le pasaría el
    // MouseEvent como opciones.
    refetch: () => void refetch(),
  }
}
