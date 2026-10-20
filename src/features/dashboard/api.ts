import { client } from 'shared/api/client'
import { fetchCount } from 'shared/api/count'

import type { DispatchedShipment, RecentOrder, WarehouseLoad } from './types'

// Frontera con Rails de los KPIs de órdenes y envíos (TESIS-53). Único lugar de
// la feature que conoce los endpoints y el vocabulario de estados del backend.
//
// Los dos listados nacieron paginados (TESIS-112 y TESIS-113), así que el
// número NO se cuenta del lado del cliente: sale del `meta.total` del scope
// filtrado, con un request de una fila por métrica (ver `fetchCount`).

/**
 * Estado que define el KPI de órdenes. Es un literal suelto y no una unión
 * completa a propósito: el panel sólo necesita **uno**, y el vocabulario entero
 * (`Order::STATUSES`) es de la feature que lo edita, no de la que lo cuenta.
 */
export const PENDING_ORDER_STATUS = 'pending'

/**
 * Los estados que cuentan como «envío activo»: los que ya salieron del depósito
 * o están por salir y todavía no llegaron. Son los mismos dos que el backend
 * llama en curso (`Shipment::IN_FLIGHT_STATUSES`) y los que pueden quedar
 * demorados. Contar sólo `in_transit` dejaba afuera los despachados que el
 * courier todavía no levantó, que son justamente los que la operación persigue.
 */
export const ACTIVE_SHIPMENT_STATUSES = ['ready_to_ship', 'in_transit'] as const

type ActiveShipmentStatus = (typeof ACTIVE_SHIPMENT_STATUSES)[number]

/** `GET /api/v1/orders?status=pending&per_page=1` → `meta.total`. */
export function fetchPendingOrderCount(): Promise<number> {
  return fetchCount('/orders', { status: PENDING_ORDER_STATUS })
}

/**
 * `GET /api/v1/shipments/counts` → `ready_to_ship + in_transit`.
 *
 * Un solo request y no un `fetchCount` por estado: el endpoint de las pestañas
 * del listado (TESIS-165) ya cuenta cada estado sobre el mismo scope, así que
 * las dos partes de la suma salen de la misma foto y no de dos consultas que
 * pueden ver la base en momentos distintos.
 */
export async function fetchActiveShipmentCount(): Promise<number> {
  const { data } = await client.get<{ data: Record<ActiveShipmentStatus, number> }>(
    '/shipments/counts',
  )

  return ACTIVE_SHIPMENT_STATUSES.reduce((sum, status) => sum + data.data[status], 0)
}

/**
 * Los dos estados de stock que son una alerta (TESIS-55).
 *
 * Son dos y no uno porque el backend los separa: `low` es
 * `BETWEEN 1 AND` el umbral del producto, así que un producto **agotado** no es
 * `low`, es `out_of_stock`. Contar sólo `low` dejaría fuera del número justo
 * los casos más graves, que son los que ya no se pueden vender.
 *
 * El umbral no vive acá: es de cada producto (`products.low_stock_threshold`,
 * TESIS-182), y son los
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
  capacity: number | null
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
    // `?? null` y no el valor crudo: si el front se despliega antes que el
    // backend que agrega el campo, `undefined` pasa el `!== null` de
    // `shareOf` y la barra sale en NaN %.
    storedUnits: warehouse.stored_units ?? 0,
    capacity: warehouse.capacity ?? null,
  }))
}

/** Cuántos envíos muestra la tarjeta del panel. */
export const RECENT_SHIPMENTS = 5

interface ApiDispatchedShipment {
  id: number
  order_id: number
  status: DispatchedShipment['status']
  tracking_number: string | null
  courier: { id: number; service_id: number; name: string } | null
  created_at: string
}

/**
 * Los últimos envíos de la empresa (`GET /api/v1/shipments?page=1&per_page=5`).
 *
 * Igual que las órdenes recientes: el backend los devuelve del más nuevo al más
 * viejo, así que la primera página *es* «los últimos cinco» y no se reordena de
 * este lado.
 */
export async function fetchRecentShipments(): Promise<DispatchedShipment[]> {
  const { data } = await client.get<{ data: ApiDispatchedShipment[] }>('/shipments', {
    params: { page: 1, per_page: RECENT_SHIPMENTS },
  })

  return data.data.map((shipment) => ({
    id: shipment.id,
    orderId: shipment.order_id,
    status: shipment.status,
    trackingNumber: shipment.tracking_number,
    courier: shipment.courier?.name ?? null,
    createdAt: shipment.created_at,
  }))
}

/**
 * Cuántas órdenes muestra el panel. Las del diseño (S03-Panel) y las que pide
 * la card: las últimas cinco, no una página del listado.
 */
export const RECENT_ORDERS = 5

interface ApiRecentOrder {
  id: number
  external_order_id: string | null
  /** Opcional: una API anterior a TESIS-180 no lo manda. */
  external_order_number?: string | null
  customer_address: string | null
  customer_zip_code: string | null
  status: RecentOrder['status']
  total_amount: number | null
  created_at: string
}

/**
 * Las últimas órdenes de la empresa (`GET /api/v1/orders?page=1&per_page=5`).
 *
 * El backend ya las devuelve de la más nueva a la más vieja, así que la primera
 * página *es* «las últimas cinco»: no se ordena de este lado, que sería tener
 * dos definiciones del mismo orden.
 */
export async function fetchRecentOrders(): Promise<RecentOrder[]> {
  const { data } = await client.get<{ data: ApiRecentOrder[] }>('/orders', {
    params: { page: 1, per_page: RECENT_ORDERS },
  })

  return data.data.map((order) => ({
    id: order.id,
    externalOrderId: order.external_order_id,
    externalOrderNumber: order.external_order_number ?? null,
    customerAddress: order.customer_address,
    customerZipCode: order.customer_zip_code,
    status: order.status,
    totalAmount: order.total_amount,
    createdAt: order.created_at,
  }))
}
