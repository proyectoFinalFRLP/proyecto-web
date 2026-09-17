import { fetchCount } from 'shared/api/count'

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
