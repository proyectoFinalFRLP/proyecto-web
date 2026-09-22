import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { fetchStockAlertCounts, fetchWarehouseLoads, LOW_STOCK_STATUS } from '../api'
import type { StockAlertCounts } from '../api'
import { inventoryKpiKeys } from '../queryKeys'
import type { WarehouseLoad } from '../types'
import type { WarehouseShare } from '../utils/capacity'
import { totalStoredUnits, warehouseShares } from '../utils/capacity'

import type { KpiState } from './useLogisticsKpis'

export interface InventoryOverview {
  /** Productos en alerta —bajo el umbral o agotados—, tal como los cuenta el backend. */
  alerts: KpiState
  /** El desglose del número, para poder decir de qué está hecho. */
  breakdown: StockAlertCounts | undefined
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
 * El conteo sale de los estados de stock del backend y no de sumar los stocks
 * en el cliente, aunque la card describa un `.reduce()`: el umbral vive en
 * `Product::LOW_STOCK_THRESHOLD` y las pestañas del catálogo filtran por ese
 * mismo criterio. Calcularlo acá con una regla propia haría que la tarjeta y
 * las pestañas a las que lleva mostraran números distintos del mismo hecho.
 * De paso, contar en el cliente exigiría traer el catálogo entero, y el
 * listado corta en 100 filas.
 *
 * La alerta son **dos** estados, no uno: `low` en el backend es
 * `BETWEEN 1 AND umbral`, así que un producto agotado no cae ahí sino en
 * `out_of_stock`. Contar sólo `low` dejaba afuera del número los casos que ya
 * no se pueden vender.
 *
 * Son dos consultas separadas porque son dos preguntas distintas: que falle el
 * listado de depósitos no tiene por qué dejar la tarjeta de alertas sin número.
 */
export function useInventoryAlerts(): InventoryOverview {
  const alerts = useQuery<StockAlertCounts>({
    queryKey: inventoryKpiKeys.alerts(LOW_STOCK_STATUS),
    queryFn: fetchStockAlertCounts,
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
      // La tarjeta muestra un solo número: todo lo que está por debajo del
      // umbral, agotado incluido.
      value: alerts.data && alerts.data.low + alerts.data.outOfStock,
      isLoading: alerts.isLoading,
      isError: alerts.isError,
    },
    breakdown: alerts.data,
    warehouses: warehouseShares(loads),
    storedUnits: totalStoredUnits(loads),
    warehousesLoading: warehouses.isLoading,
    isError: alerts.isError || warehouses.isError,
    refetch,
  }
}
