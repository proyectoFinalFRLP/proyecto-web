import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { fetchLowStockCount, fetchWarehouseLoads, LOW_STOCK_STATUS } from '../api'
import { inventoryKpiKeys } from '../queryKeys'
import type { WarehouseLoad } from '../types'
import type { WarehouseShare } from '../utils/capacity'
import { totalStoredUnits, warehouseShares } from '../utils/capacity'

import type { KpiState } from './useLogisticsKpis'

export interface InventoryOverview {
  /** Productos con stock bajo, tal como los cuenta el backend. */
  alerts: KpiState
  /** Depósitos ordenados de más a menos cargado, con el ancho de su barra. */
  warehouses: WarehouseShare[]
  /** Unidades guardadas entre todos los depósitos. */
  storedUnits: number
  warehousesLoading: boolean
  /** Alguna de las dos consultas falló. */
  isError: boolean
  refetch: () => void
}

/**
 * Lo que el panel muestra del inventario (TESIS-55): cuántos productos están en
 * alerta de stock y cuánto guarda cada depósito.
 *
 * El conteo de alertas sale del `status=low` del backend y no de sumar los
 * stocks en el cliente, aunque la card describa un `.reduce()`: el umbral vive
 * en `Product::LOW_STOCK_THRESHOLD` y la pestaña «Stock bajo» del catálogo
 * filtra por ese mismo criterio. Calcularlo acá con una regla propia haría que
 * la tarjeta y la pestaña a la que lleva mostraran números distintos, que es
 * justo lo que el criterio de finalización pide evitar. De paso, contar en el
 * cliente exigiría traer el catálogo entero, y el listado corta en 100 filas.
 *
 * Son dos consultas separadas porque son dos preguntas distintas: que falle el
 * listado de depósitos no tiene por qué dejar la tarjeta de alertas sin número.
 */
export function useInventoryAlerts(): InventoryOverview {
  const alerts = useQuery<number>({
    queryKey: inventoryKpiKeys.alerts(LOW_STOCK_STATUS),
    queryFn: fetchLowStockCount,
  })

  const warehouses = useQuery<WarehouseLoad[]>({
    queryKey: inventoryKpiKeys.warehouseLoads(),
    queryFn: fetchWarehouseLoads,
  })

  const { refetch: refetchAlerts } = alerts
  const { refetch: refetchWarehouses } = warehouses

  // Envuelto por lo mismo que en `useLogisticsKpis`: el `refetch` de React Query
  // recibe opciones, y cablearlo a un `onClick` le pasaría el MouseEvent.
  const refetch = useCallback(() => {
    void refetchAlerts()
    void refetchWarehouses()
  }, [refetchAlerts, refetchWarehouses])

  const loads = warehouses.data ?? []

  return {
    alerts: {
      value: alerts.data,
      isLoading: alerts.isLoading,
      isError: alerts.isError,
    },
    warehouses: warehouseShares(loads),
    storedUnits: totalStoredUnits(loads),
    warehousesLoading: warehouses.isLoading,
    isError: alerts.isError || warehouses.isError,
    refetch,
  }
}
