// Estado de frescura derivado de `last_synced_at`:
// - `online`  → sincronizó dentro de la ventana esperada (ícono `check_circle`)
// - `stale`   → la última sync quedó fuera de la ventana (ícono `error`)
// - `unknown` → no hay marca de sync: no afirmamos nada (ícono neutro)
export type NodeSyncStatus = 'online' | 'stale' | 'unknown'

/**
 * Un depósito y las unidades que guarda, para el widget de carga del panel
 * (TESIS-55).
 *
 * No hay porcentaje de ocupación y no es un olvido: `warehouses` no tiene
 * ninguna capacidad máxima contra la cual medirlo. La barra del widget compara
 * los depósitos entre sí, y de eso se encarga `warehouseShares`.
 */
export interface WarehouseLoad {
  id: number
  name: string
  /** Suma de las unidades en stock del depósito. Cero es un dato, no un faltante. */
  storedUnits: number
}

/** Los tres estados que el backend acepta (`Order::STATUSES`). */
export type OrderStatus = 'pending' | 'paid' | 'cancelled'

/**
 * Una fila de la tabla de órdenes recientes del panel (TESIS-56). Es la fila de
 * `GET /api/v1/orders` recortada a las cinco columnas que el diseño dibuja.
 *
 * Tres campos pueden llegar vacíos y la tabla tiene que tolerarlo:
 * `externalOrderId` es null en las ventas cargadas a mano, `customerAddress` y
 * `customerZipCode` en las órdenes viejas sin destino, y `totalAmount` en las
 * anteriores a TESIS-114.
 */
export interface RecentOrder {
  id: number
  externalOrderId: string | null
  customerAddress: string | null
  customerZipCode: string | null
  status: OrderStatus
  totalAmount: number | null
  createdAt: string
}
