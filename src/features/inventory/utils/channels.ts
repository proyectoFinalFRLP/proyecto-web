import type { ApiRequestError, IntegrationService } from 'shared/api'
import { formatRelativeTime } from 'shared/utils'

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

/**
 * Lo que dice la fila de un canal sobre la publicación del stock (TESIS-177):
 * el motivo si el último intento falló, cuándo salió bien si no, y nada si
 * todavía no se intentó.
 */
export function mappingSyncStatus(
  mapping: ProductMapping,
  now: Date = new Date(),
): { tone: 'error' | 'ok'; text: string } | null {
  if (mapping.lastSyncError) return { tone: 'error', text: copy.syncFailed(mapping.lastSyncError) }
  if (!mapping.lastSyncedAt) return null

  const ago = formatRelativeTime(mapping.lastSyncedAt, now)
  return ago ? { tone: 'ok', text: copy.syncedAgo(ago) } : null
}

/**
 * «Reintentar» tiene sentido cuando el último intento falló o cuando nunca se
 * intentó (un vínculo anterior a TESIS-177). Con la última publicación al día
 * el botón sólo sería una forma de gastar el límite por minuto.
 */
export function canRetry(mapping: ProductMapping): boolean {
  return mapping.lastSyncError !== null || mapping.lastSyncedAt === null
}

/**
 * El rechazo de un «Reintentar». El 422 trae el motivo (al canal le falta
 * configuración o al vínculo, referencias): se muestra tal cual, porque dice
 * qué arreglar. El 429 es el límite por minuto del back.
 */
export function resyncErrorMessage(error: ApiRequestError): string {
  if (error.status === 422) return copy.syncFailed(error.message)
  if (error.status === 429) return copy.retryTooSoon
  if (error.status === 404) return copy.retryGone
  return error.message
}

export interface StockSyncWarning {
  integrationId: number
  name: string
  messages: string[]
}

/**
 * Los canales conectados que no están publicando el stock, con por qué: les
 * falta configuración (en Shopify, la ubicación de stock) o tienen productos
 * cuyo último intento falló. Un canal sin `stockSync` (no publica stock o el
 * back todavía no lo informa) no avisa nada.
 */
export function stockSyncWarnings(integrations: IntegrationService[]): StockSyncWarning[] {
  return integrations.flatMap((integration) => {
    const { stockSync, integrationId } = integration
    if (!stockSync || integrationId === null || !integration.isActive) return []

    const messages: string[] = []
    if (!stockSync.ready && stockSync.missingSettings.length > 0) {
      messages.push(copy.missingSettings(stockSync.missingSettings.map(({ label }) => label)))
    }
    if (stockSync.failingProducts > 0)
      messages.push(copy.failingProducts(stockSync.failingProducts))

    return messages.length > 0 ? [{ integrationId, name: integration.name, messages }] : []
  })
}
