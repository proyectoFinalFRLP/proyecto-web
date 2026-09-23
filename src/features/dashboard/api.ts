import { client } from 'shared/api/client'
import { fetchCount } from 'shared/api/count'

import type { WarehouseLoad } from './types'

// Frontera con Rails de los KPIs de órdenes y envíos (TESIS-53). Único lugar de
// la feature que conoce los endpoints y el vocabulario de estados del backend.
//
// Los dos listados nacieron paginados (TESIS-112 y TESIS-113), así que el
// número NO se cuenta del lado del cliente: sale del `meta.total` del scope
// filtrado, con un request de una fila por métrica (ver `fetchCount`).

/**
 * Estado que define cada KPI. Son literales sueltos y no una unión completa a
 * propósito: el panel sólo necesita **uno** por recurso, y el vocabulario
 * entero (`Order::STATUSES`, `Shipment::STATUSES`) es de las features que lo
 * editan, no de la que lo cuenta.
 */
export const PENDING_ORDER_STATUS = 'pending'
export const ACTIVE_SHIPMENT_STATUS = 'in_transit'

/** `GET /api/v1/orders?status=pending&per_page=1` → `meta.total`. */
export function fetchPendingOrderCount(): Promise<number> {
  return fetchCount('/orders', { status: PENDING_ORDER_STATUS })
}

/**
 * `GET /api/v1/shipments?status=in_transit&per_page=1` → `meta.total`.
 *
 * Contra datos reales va a dar 0 hasta que la operación despache: hoy los
 * envíos se crean con TESIS-105 y avanzan a `in_transit` con el tracking del
 * courier (TESIS-48), que todavía no está. No es un bug del panel.
 */
export function fetchActiveShipmentCount(): Promise<number> {
  return fetchCount('/shipments', { status: ACTIVE_SHIPMENT_STATUS })
}

/**
 * Los dos estados de stock que son una alerta (TESIS-55).
 *
 * Son dos y no uno porque el backend los separa: `low` es
 * `BETWEEN 1 AND LOW_STOCK_THRESHOLD`, así que un producto **agotado** no es
 * `low`, es `out_of_stock`. Contar sólo `low` dejaría fuera del número justo
 * los casos más graves, que son los que ya no se pueden vender.
 *
 * El umbral no vive acá: lo decide `Product::LOW_STOCK_THRESHOLD`, y son los
 * mismos estados que filtran las pestañas del catálogo. Calcularlo en el
 * cliente con una regla propia haría que el panel y el inventario mostraran
 * números distintos del mismo hecho.
 */
export const LOW_STOCK_STATUS = 'low'
export const OUT_OF_STOCK_STATUS = 'out_of_stock'

/** Cuántos productos hay en cada estado de alerta. */
export interface StockAlertCounts {
  low: number
  outOfStock: number
}

/**
 * Los dos conteos, en paralelo.
 *
 * Van juntos en una sola consulta y no en dos: lo que la tarjeta muestra es la
 * suma, y si una de las dos fallara, sumar la que llegó daría un número más
 * bajo que el real sin que nada lo delate. O están los dos o no hay número.
 */
export async function fetchStockAlertCounts(): Promise<StockAlertCounts> {
  const [low, outOfStock] = await Promise.all([
    fetchCount('/products', { status: LOW_STOCK_STATUS }),
    fetchCount('/products', { status: OUT_OF_STOCK_STATUS }),
  ])

  return { low, outOfStock }
}

interface ApiWarehouse {
  id: number
  name: string
  stored_units: number
}

/**
 * Cuántas unidades guarda cada depósito (`GET /api/v1/warehouses`).
 *
 * El listado no pagina, así que vienen todos. `stored_units` lo agrega la API
 * (TESIS-127): sumarlo acá obligaría a recorrer el catálogo entero, que corta
 * en 100 filas por página y dejaría el panel contando de menos sin avisar.
 */
export async function fetchWarehouseLoads(): Promise<WarehouseLoad[]> {
  const { data } = await client.get<{ data: ApiWarehouse[] }>('/warehouses')

  return data.data.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    storedUnits: warehouse.stored_units,
  }))
}
