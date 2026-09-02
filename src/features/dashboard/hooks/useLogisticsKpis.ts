import { useCallback, useMemo } from 'react'

import type { OrderStatus, ShipmentStatus } from '../types'

import { useOrders } from './useOrders'
import { useShipments } from './useShipments'

// Estados que definen cada KPI: órdenes todavía sin procesar y envíos que hoy
// están viajando. Constantes (y no literales en el filter) para que el criterio
// del KPI se lea de un vistazo y se cambie en un solo lugar.
const PENDING_ORDER_STATUS: OrderStatus = 'pending'
const ACTIVE_SHIPMENT_STATUS: ShipmentStatus = 'in_transit'

export interface LogisticsKpis {
  pendingOrders: number
  totalOrders: number
  activeShipments: number
  totalShipments: number
  isOrdersLoading: boolean
  isShipmentsLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

// Deriva los KPIs de las listas que ya trajo React Query. Es una proyección
// memoizada sobre `data` — no hay estado duplicado ni un fetch extra —, así que
// el número queda disponible en el mismo render en que llega la respuesta y solo
// se recalcula si cambia la lista.
export function useLogisticsKpis(): LogisticsKpis {
  const ordersQuery = useOrders()
  const shipmentsQuery = useShipments()

  const { data: orders, refetch: refetchOrders } = ordersQuery
  const { data: shipments, refetch: refetchShipments } = shipmentsQuery

  const orderCounts = useMemo(
    () => ({
      pending: orders?.filter((order) => order.status === PENDING_ORDER_STATUS).length ?? 0,
      total: orders?.length ?? 0,
    }),
    [orders],
  )

  const shipmentCounts = useMemo(
    () => ({
      active:
        shipments?.filter((shipment) => shipment.status === ACTIVE_SHIPMENT_STATUS).length ?? 0,
      total: shipments?.length ?? 0,
    }),
    [shipments],
  )

  const refetch = useCallback(() => {
    void refetchOrders()
    void refetchShipments()
  }, [refetchOrders, refetchShipments])

  return {
    pendingOrders: orderCounts.pending,
    totalOrders: orderCounts.total,
    activeShipments: shipmentCounts.active,
    totalShipments: shipmentCounts.total,
    isOrdersLoading: ordersQuery.isLoading,
    isShipmentsLoading: shipmentsQuery.isLoading,
    isError: ordersQuery.isError || shipmentsQuery.isError,
    error: ordersQuery.error ?? shipmentsQuery.error,
    refetch,
  }
}
