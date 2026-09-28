// Tipo de servicio externo (`services.type`, con check constraint en la DB).
export type ServiceType = 'ecommerce' | 'courier'

// Fila de `GET /api/v1/integrations`.
//
// Ojo con el nombre: el endpoint NO devuelve `company_integrations`. Devuelve
// TODOS los `services` y le mergea encima el estado de la integración de la
// empresa del token (`IntegrationStatusSerializer`). Por eso el identificador
// es `service_id` y no `id`, y por eso el filtro de "nodo activo" que pide la
// card se resuelve en el cliente con `configured && is_active`.
export interface IntegrationNode {
  service_id: number
  service_name: string
  type: ServiceType
  uri: string
  http_method: string
  /** La empresa del token tiene una `company_integration` para este service. */
  configured: boolean
  /** `is_active` de esa integración. `false` si no está configurada. */
  is_active: boolean
  integration_id: number | null
  /**
   * Marca de la última sincronización exitosa.
   *
   * Hoy el backend NO lo manda: `company_integrations` no tiene la columna y
   * `IntegrationStatusSerializer` no serializa ninguna fecha. Queda opcional a
   * propósito para que el widget ya esté cableado contra el contrato final y se
   * encienda solo cuando el worker de sync (TESIS-35) empiece a registrarla.
   * Mientras llegue `undefined`/`null`, el nodo se muestra en estado `unknown`
   * en vez de asumir que está sano.
   */
  last_synced_at?: string | null
}

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
