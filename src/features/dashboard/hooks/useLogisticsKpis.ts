import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  ACTIVE_SHIPMENT_STATUS,
  fetchActiveShipmentCount,
  fetchPendingFailedEventCount,
  fetchPendingOrderCount,
  PENDING_FAILED_EVENT_STATUS,
  PENDING_ORDER_STATUS,
} from '../api'
import { failedEventKeys, orderKeys, shipmentKeys } from '../queryKeys'

export interface KpiState {
  /** El total que devolvió la API, o `undefined` mientras carga o si falló. */
  value: number | undefined
  isLoading: boolean
  isError: boolean
}

export interface LogisticsKpis {
  pendingOrders: KpiState
  activeShipments: KpiState
  /**
   * Los eventos que siguen esperando en la cola de reintentos (TESIS-163).
   * Reemplaza al KPI de «Salud del sistema», que mostraba un porcentaje
   * derivado de la frescura de los nodos: es la misma salud dicha como un
   * número sobre el que se puede actuar.
   */
  failedEvents: KpiState
  /** Alguna de las consultas falló. */
  isError: boolean
  refetch: () => void
}

/**
 * KPIs de flujo de órdenes y envíos (TESIS-53): órdenes pendientes y envíos en
 * tránsito.
 *
 * Son dos consultas independientes y no una combinada a propósito: cada
 * tarjeta muestra su propio estado de carga, y que falle una no deja a la otra
 * sin número. El valor es el `meta.total` que ya viene contado del servidor,
 * así que no hay cálculo del lado del cliente: el número está listo en el
 * mismo render en que llega la respuesta.
 */
export function useLogisticsKpis(): LogisticsKpis {
  const pendingOrders = useQuery<number>({
    queryKey: orderKeys.kpi(PENDING_ORDER_STATUS),
    queryFn: fetchPendingOrderCount,
  })

  const activeShipments = useQuery<number>({
    queryKey: shipmentKeys.kpi(ACTIVE_SHIPMENT_STATUS),
    queryFn: fetchActiveShipmentCount,
  })

  const failedEvents = useQuery<number>({
    queryKey: failedEventKeys.kpi(PENDING_FAILED_EVENT_STATUS),
    queryFn: fetchPendingFailedEventCount,
  })

  const { refetch: refetchPendingOrders } = pendingOrders
  const { refetch: refetchActiveShipments } = activeShipments
  const { refetch: refetchFailedEvents } = failedEvents

  // Envuelto: `refetch` de React Query recibe `RefetchOptions`, y cablearlo
  // directo a un `onClick` le pasaría el MouseEvent como opciones.
  const refetch = useCallback(() => {
    void refetchPendingOrders()
    void refetchActiveShipments()
    void refetchFailedEvents()
  }, [refetchPendingOrders, refetchActiveShipments, refetchFailedEvents])

  return {
    pendingOrders: {
      value: pendingOrders.data,
      isLoading: pendingOrders.isLoading,
      isError: pendingOrders.isError,
    },
    activeShipments: {
      value: activeShipments.data,
      isLoading: activeShipments.isLoading,
      isError: activeShipments.isError,
    },
    failedEvents: {
      value: failedEvents.data,
      isLoading: failedEvents.isLoading,
      isError: failedEvents.isError,
    },
    isError: pendingOrders.isError || activeShipments.isError || failedEvents.isError,
    refetch,
  }
}
