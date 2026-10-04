import { client } from './client'
import type { ApiResponse } from './types'

// Frontera con `GET /api/v1/integrations` (TESIS-139). Vive en `shared/` por la
// Regla de Dos: lo leen el panel (salud de los nodos), la pantalla de
// integraciones y el detalle de producto (canales donde vincularlo).
//
// Ojo con el nombre: el endpoint NO devuelve `company_integrations`. Devuelve
// las plantillas conectables (`services`) con el estado de la integración de la
// empresa del token encima. Por eso el identificador es `service_id`.
//
// Es de sólo lectura: las credenciales las carga el equipo de OneStock desde el
// backoffice (ADR-018 del backend), así que acá no viaja nada para conectar.

/** Tipo de servicio externo (`services.type`, con check constraint en la DB). */
export type ServiceType = 'ecommerce' | 'courier'

export interface IntegrationService {
  serviceId: number
  name: string
  type: ServiceType
  /** La empresa del token tiene una integración para esta plantilla. */
  configured: boolean
  isActive: boolean
  integrationId: number | null
  /** El nombre de la cuenta en el proveedor (en Shopify, el de la tienda), si se conoce. */
  accountName: string | null
  /**
   * Marca de la última sincronización exitosa. Hoy el backend no la manda
   * (`company_integrations` no tiene la columna): queda opcional para que el
   * widget de salud ya esté cableado y se encienda solo cuando exista.
   */
  lastSyncedAt: string | null
}

interface ApiIntegrationService {
  service_id: number
  service_name: string
  type: ServiceType
  configured: boolean
  is_active: boolean
  integration_id: number | null
  account_name?: string | null
  last_synced_at?: string | null
}

export const integrationKeys = {
  all: ['integrations'] as const,
  lists: () => [...integrationKeys.all, 'list'] as const,
}

export function toIntegrationService(row: ApiIntegrationService): IntegrationService {
  return {
    serviceId: row.service_id,
    name: row.service_name,
    type: row.type,
    configured: row.configured,
    isActive: row.is_active,
    integrationId: row.integration_id,
    accountName: row.account_name ?? null,
    lastSyncedAt: row.last_synced_at ?? null,
  }
}

/**
 * `GET /api/v1/integrations`. Viaja envuelto en `data` como toda colección de la
 * API (ADR-015 del backend) y con `meta`, que acá no se usa: el back la manda
 * entera (`WHOLE_LIST_PER_PAGE`).
 */
export async function fetchIntegrations(): Promise<IntegrationService[]> {
  const { data } = await client.get<ApiResponse<ApiIntegrationService[]>>('/integrations')
  return data.data.map(toIntegrationService)
}
