import type { ApiRequestError, IntegrationService } from 'shared/api'

import { inventoryCopy } from '../content'
import type { ProductMapping } from '../types'

const { channels: copy } = inventoryCopy

export interface LinkableChannel {
  integrationId: number
  name: string
}

/**
 * Dónde se puede vincular el producto: canales de venta conectados y activos
 * donde todavía no está publicado (un producto = una publicación por canal).
 */
export function linkableChannels(
  integrations: IntegrationService[],
  mappings: ProductMapping[],
): LinkableChannel[] {
  const linked = new Set(mappings.map((mapping) => mapping.companyIntegrationId))

  return integrations.flatMap((integration) =>
    integration.type === 'ecommerce' &&
    integration.configured &&
    integration.isActive &&
    integration.integrationId !== null &&
    !linked.has(integration.integrationId)
      ? [{ integrationId: integration.integrationId, name: integration.name }]
      : [],
  )
}

/**
 * El rechazo de un vínculo, en el idioma de la pantalla. El back contesta en
 * inglés y con un status que ya dice qué pasó; el texto crudo sólo se muestra
 * si el status no es uno de los esperados.
 */
export function linkErrorMessage(error: ApiRequestError): string {
  if (error.status === 409) return copy.alreadyLinked
  if (error.status === 422) return copy.notFound
  if (error.status === 502) return copy.channelDown
  return error.message
}
