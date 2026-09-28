import { useQuery } from '@tanstack/react-query'

import { quoteDraft } from '../api'
import { quoteKeys } from '../queryKeys'
import type { ShippingQuote } from '../types'
import type { DraftQuotePayload } from '../utils/shipping'

// Una tarifa caduca enseguida: pasado un minuto, volver al paso 3 cotiza de
// nuevo en vez de mostrar precios que el courier ya no sostiene.
const QUOTE_TTL_MS = 60_000

/**
 * Las opciones de envío del borrador (paso 3, S07), pedidas apenas se entra al
 * paso. `null` mientras falta algún dato del borrador: no hay nada que cotizar.
 *
 * Sin reintento automático: el backend ya espera a cada courier hasta su propio
 * timeout, y reintentar en silencio duplicaría esa espera. Si falla, la
 * pantalla ofrece reintentar.
 */
export function useDraftQuotes(payload: DraftQuotePayload | null) {
  return useQuery<ShippingQuote[]>({
    // La clave con `null` nunca se pide (`enabled`): sólo está para que el tipo
    // cierre sin inventar un borrador vacío.
    queryKey: payload === null ? quoteKeys.all : quoteKeys.draft(payload),
    queryFn: () => quoteDraft(payload as DraftQuotePayload),
    enabled: payload !== null,
    staleTime: QUOTE_TTL_MS,
    retry: false,
  })
}
