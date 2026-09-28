import { useQuery } from '@tanstack/react-query'

import { quoteOrder } from '../api'
import { quoteKeys } from '../queryKeys'
import type { ShippingQuote } from '../types'
import { toOrderQuotePayload } from '../utils/dispatch'

// Mismo plazo que la cotización del borrador: pasado un minuto, la tarifa ya no
// es la que el courier sostiene.
const QUOTE_TTL_MS = 60_000

/**
 * Las opciones de envío de una orden que ya existe, para despacharla desde su
 * detalle (TESIS-134). `null` mientras no se sabe de qué depósito sale: sin
 * origen no hay nada que cotizar.
 *
 * Sin reintento automático, como en el paso 3: el backend ya espera a cada
 * courier hasta su timeout, y la pantalla ofrece volver a cotizar.
 */
export function useOrderQuotes(orderId: number, originWarehouseId: number | null) {
  return useQuery<ShippingQuote[]>({
    // La clave con `null` nunca se pide (`enabled`): sólo está para que el tipo
    // cierre sin inventar un depósito.
    queryKey:
      originWarehouseId === null ? quoteKeys.all : quoteKeys.order(orderId, originWarehouseId),
    queryFn: () => quoteOrder(orderId, toOrderQuotePayload(originWarehouseId ?? 0)),
    enabled: originWarehouseId !== null,
    staleTime: QUOTE_TTL_MS,
    retry: false,
  })
}
