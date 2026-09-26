import { client } from './client'
import type { ApiResponse } from './types'

// Frontera con `GET /api/v1/integrations` (TESIS-139). Vive en `shared/` por la
// Regla de Dos: lo leen el panel (salud de los nodos), la pantalla de
// integraciones y el detalle de producto (canales donde vincularlo).
//
// Ojo con el nombre: el endpoint NO devuelve `company_integrations`. Devuelve
// las plantillas conectables (`services`) con el estado de la integración de la
// empresa del token encima. Por eso el identificador es `service_id`.

/** Tipo de servicio externo (`services.type`, con check constraint en la DB). */
export type ServiceType = 'ecommerce' | 'courier'

/**
 * Un dato que la plantilla le pide a la empresa para conectarse. Es la única
 * fuente de verdad del formulario de conexión: un campo nuevo en la plantilla
 * (desde el backoffice) aparece en el front sin tocar código.
 */
export interface IntegrationFieldSpec {
  key: string
  label: string
  required: boolean
  /** Expresión regular (sintaxis de Ruby) que el valor tiene que cumplir. */
  format: string | null
}

export interface IntegrationService {
  serviceId: number
  name: string
  type: ServiceType
  /** `oauth_client_credentials`: el token lo obtiene el sistema, no la empresa. */
  authStrategy: string
  /** Secretos: se muestran como contraseña y nunca se precargan. */
  credentialFields: IntegrationFieldSpec[]
  /** Configuración no secreta: se precarga con `settings`. */
  settingFields: IntegrationFieldSpec[]
  /** La empresa del token tiene una integración para esta plantilla. */
  configured: boolean
  isActive: boolean
  integrationId: number | null
  settings: Record<string, string>
  /** Qué secretos están cargados: sólo las claves, el back nunca manda los valores. */
  credentialsSet: string[]
  /** Si «probar conexión» tiene algo que verificar. */
  testable: boolean
  /**
   * Marca de la última sincronización exitosa. Hoy el backend no la manda
   * (`company_integrations` no tiene la columna): queda opcional para que el
   * widget de salud ya esté cableado y se encienda solo cuando exista.
   */
  lastSyncedAt: string | null
}

interface ApiFieldSpec {
  key: string
  label?: string
  required?: boolean
  format?: string | null
}

interface ApiIntegrationService {
  service_id: number
  service_name: string
  type: ServiceType
  auth_strategy?: string
  credential_fields?: ApiFieldSpec[]
  setting_fields?: ApiFieldSpec[]
  configured: boolean
  is_active: boolean
  integration_id: number | null
  settings?: Record<string, string>
  credentials_set?: string[]
  testable?: boolean
  last_synced_at?: string | null
}

export const integrationKeys = {
  all: ['integrations'] as const,
  lists: () => [...integrationKeys.all, 'list'] as const,
}

// Un campo sin etiqueta muestra su clave: mejor un rótulo técnico que un input
// sin nombre.
function toFieldSpec(field: ApiFieldSpec): IntegrationFieldSpec {
  return {
    key: field.key,
    label: field.label ?? field.key,
    required: field.required === true,
    format: field.format ?? null,
  }
}

export function toIntegrationService(row: ApiIntegrationService): IntegrationService {
  return {
    serviceId: row.service_id,
    name: row.service_name,
    type: row.type,
    authStrategy: row.auth_strategy ?? 'bearer',
    credentialFields: (row.credential_fields ?? []).map(toFieldSpec),
    settingFields: (row.setting_fields ?? []).map(toFieldSpec),
    configured: row.configured,
    isActive: row.is_active,
    integrationId: row.integration_id,
    settings: row.settings ?? {},
    credentialsSet: row.credentials_set ?? [],
    testable: row.testable === true,
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
