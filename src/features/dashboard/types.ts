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
// - `online`  → sincronizó dentro de la ventana esperada (ícono `check_circle`)
// - `stale`   → la última sync quedó fuera de la ventana (ícono `error`)
// - `unknown` → no hay marca de sync: no afirmamos nada (ícono neutro)
export type NodeSyncStatus = 'online' | 'stale' | 'unknown'
