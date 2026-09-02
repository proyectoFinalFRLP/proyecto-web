// Tipos mínimos de orden y envío: solo lo que hoy consume el dashboard. Los
// valores de `status` y el nombre de los campos salen del backend real
// (`Order::STATUSES`, `Shipment::STATUSES` y el schema de la API), que serializa
// con Blueprinter en snake_case. Crecerán cuando existan las features `orders` y
// `shipments`.

export type OrderStatus = 'pending' | 'paid' | 'cancelled'

export type ShipmentStatus = 'pending' | 'ready_to_ship' | 'in_transit' | 'delivered'

export interface Order {
  id: number
  status: OrderStatus
  created_at: string
}

export interface Shipment {
  id: number
  status: ShipmentStatus
  created_at: string
}

// ── Infraestructura / nodos de integración ───────────────────────────────────

// Tipo de servicio externo (`services.type`, con check constraint en la DB).
export type ServiceType = 'ecommerce' | 'courier'

// Fila de `GET /api/v1/integrations`.
//
// Ojo con el nombre: el endpoint NO devuelve `company_integrations`. Devuelve
// TODOS los `services` y le mergea encima el estado de la integración de la
// empresa del token (`IntegrationStatusSerializer`). Por eso el identificador
// es `service_id` y no `id`, y por eso el filtro de "nodo activo" que pide la
// card se resuelve en el cliente con `configured && is_active`.
//
// Responde un array plano, sin el envoltorio `{ data }` de `ApiResponse`.
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
// - `online`  → sincronizó dentro de la ventana esperada (LED azul)
// - `stale`   → la última sync quedó fuera de la ventana (LED rojo)
// - `unknown` → no hay marca de sync: no afirmamos nada (LED neutro)
export type NodeSyncStatus = 'online' | 'stale' | 'unknown'
