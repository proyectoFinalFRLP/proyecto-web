import { z } from 'zod'

import { TENANT_CONFIG_PATH } from '../utils/tenant'

import { client } from './client'

// Frontera con Rails para la config de tenant y único lugar que conoce su
// forma. Dos cosas del §3 del contrato que no se pueden adivinar desde el
// resto de la app:
//
//   1. La respuesta viene en **snake_case** (`display_name`, `primary_color`).
//   2. Viene **pelada**, sin el envoltorio `{ data: ... }` del resto de la API.
//
// Se valida con Zod en vez de castear porque llega antes del login, de un
// endpoint público, y alimenta al tema: un color roto acá no es un dato feo en
// una tabla, es la app entera sin pintar.

const brandingSchema = z.object({
  display_name: z.string().optional(),
  primary_color: z.string().optional(),
  accent_color: z.string().optional(),
  logo_url: z.string().nullish(),
  tagline: z.string().nullish(),
})

export const tenantConfigSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  branding: brandingSchema.default({}),
  features: z.record(z.string(), z.boolean()).default({}),
})

export type TenantConfig = z.infer<typeof tenantConfigSchema>
export type TenantBranding = TenantConfig['branding']
export type TenantFeatureFlags = TenantConfig['features']

/**
 * Features que la app sabe encender o apagar. Es una unión y no `string` para
 * que un flag mal tipeado en una ruta falle al compilar; los flags que el
 * backend mande de más se conservan en la config pero no gobiernan nada.
 */
export type TenantFeature = 'integrations'

/**
 * Un flag ausente es un flag apagado: la empresa que no compró la feature no la
 * tiene declarada en su config, y el default nunca puede ser mostrarla.
 */
export function isFeatureEnabled(
  features: TenantFeatureFlags | undefined,
  feature: TenantFeature,
): boolean {
  return features?.[feature] === true
}

/**
 * `GET /tenant-config` — público. El slug viaja en el header que agrega el
 * interceptor del cliente, que además **omite el JWT** en este endpoint: la
 * respuesta tiene que describir el portal que se pide y no la sesión abierta.
 */
export async function fetchTenantConfig(): Promise<TenantConfig> {
  const { data } = await client.get<unknown>(TENANT_CONFIG_PATH)
  return tenantConfigSchema.parse(data)
}
