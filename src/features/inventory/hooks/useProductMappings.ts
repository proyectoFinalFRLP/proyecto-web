import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Query } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ApiRequestError } from 'shared/api'
import { integrationKeys } from 'shared/api'

import { fetchProductMappings, linkProduct, resyncProductMapping, unlinkProduct } from '../api'
import { inventoryKeys } from '../queryKeys'
import type { LinkProductPayload, LinkProductResult, ProductMapping } from '../types'

export function useProductMappings(
  productId: number,
  refetchInterval?: (query: Query<ProductMapping[]>) => number | false,
) {
  return useQuery<ProductMapping[]>({
    queryKey: inventoryKeys.mappings(productId),
    queryFn: () => fetchProductMappings(productId),
    refetchInterval,
  })
}

/** Cada cuánto se vuelven a pedir los vínculos mientras un canal está publicando. */
export const PUBLISH_POLL_MS = 2_000
/** Hasta cuándo se espera el resultado del job antes de dejar de preguntar. */
export const PUBLISH_TIMEOUT_MS = 30_000

interface PublishWatch {
  /** El `lastSyncedAt` del vínculo antes de encolar la publicación. */
  baseline: string | null
  timedOut: boolean
}

/**
 * Los vínculos del producto, siguiendo las publicaciones que se encolaron desde
 * esta pantalla (TESIS-177). Crear un vínculo o «Reintentar» sólo encola un
 * job: la respuesta llega antes de que el job escriba `last_synced_at` /
 * `last_sync_error`, y con el `staleTime` de 5 minutos la fila quedaba con el
 * resultado viejo. Mientras haya un vínculo publicando se piden de nuevo cada
 * `PUBLISH_POLL_MS`, hasta que su `lastSyncedAt` cambie (el job escribió el
 * intento nuevo) o pasen `PUBLISH_TIMEOUT_MS`. Se compara contra el valor
 * anterior y no contra el reloj del navegador, que puede no coincidir con el
 * del servidor.
 *
 * Cuando una publicación termina (o se deja de esperar) se piden también las
 * integraciones, para que el aviso «N productos sin publicar» se actualice.
 */
export function useWatchedProductMappings(productId: number) {
  const queryClient = useQueryClient()
  const [watches, setWatches] = useState<Record<number, PublishWatch>>({})
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const isPublishing = useCallback(
    (mapping: ProductMapping) => {
      const watch = watches[mapping.id]
      return watch !== undefined && !watch.timedOut && mapping.lastSyncedAt === watch.baseline
    },
    [watches],
  )

  const mappings = useProductMappings(productId, (query) =>
    (query.state.data ?? []).some(isPublishing) ? PUBLISH_POLL_MS : false,
  )

  const refreshIntegrations = useCallback(
    () => queryClient.invalidateQueries({ queryKey: integrationKeys.all }),
    [queryClient],
  )

  const watch = useCallback(
    (mappingId: number, baseline: string | null) => {
      clearTimeout(timers.current.get(mappingId))
      setWatches((current) => ({ ...current, [mappingId]: { baseline, timedOut: false } }))
      timers.current.set(
        mappingId,
        setTimeout(() => {
          timers.current.delete(mappingId)
          setWatches((current) => {
            const expired = current[mappingId]
            return expired ? { ...current, [mappingId]: { ...expired, timedOut: true } } : current
          })
          void refreshIntegrations()
        }, PUBLISH_TIMEOUT_MS),
      )
    },
    [refreshIntegrations],
  )

  // Las publicaciones que ya terminaron: el vínculo tiene un intento nuevo o
  // se desvinculó. Su espera se cancela y se refrescan las integraciones.
  const rows = mappings.data
  const settled = Object.keys(watches)
    .map(Number)
    .filter((id) => !watches[id].timedOut)
    .filter((id) => {
      const mapping = rows?.find((row) => row.id === id)
      return rows !== undefined && mapping?.lastSyncedAt !== watches[id].baseline
    })
    .join(',')

  useEffect(() => {
    if (!settled) return
    for (const id of settled.split(',').map(Number)) {
      clearTimeout(timers.current.get(id))
      timers.current.delete(id)
    }
    void refreshIntegrations()
  }, [settled, refreshIntegrations])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => clearTimeout(timer))
  }, [])

  /** La espera venció y el job todavía no escribió el intento nuevo. */
  const timedOut = (mapping: ProductMapping) => {
    const current = watches[mapping.id]
    return current !== undefined && current.timedOut && mapping.lastSyncedAt === current.baseline
  }

  return { mappings, watch, isPublishing, timedOut }
}

export function useLinkProduct(productId: number) {
  const queryClient = useQueryClient()

  return useMutation<LinkProductResult, ApiRequestError, LinkProductPayload>({
    mutationFn: (payload) => linkProduct(productId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.mappings(productId) }),
  })
}

export function useUnlinkProduct(productId: number) {
  const queryClient = useQueryClient()

  return useMutation<void, ApiRequestError, number>({
    mutationFn: (mappingId) => unlinkProduct(productId, mappingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.mappings(productId) }),
  })
}

interface ResyncHandlers {
  onMutate?: (mapping: ProductMapping) => void
  onSuccess?: (mapping: ProductMapping) => void
  onError?: (error: ApiRequestError, mapping: ProductMapping) => void
}

/**
 * «Reintentar» de un canal (TESIS-177). Recibe el vínculo tal como estaba al
 * apretar el botón. Los callbacks van en las opciones de `useMutation` y no en
 * `mutate()`: TanStack v5 sólo corre los de `mutate()` de la última llamada, y
 * con dos canales reintentados seguidos se perdía el 422 o el 429 del primero.
 * `pendingIds` dice qué vínculos tienen un reintento en vuelo, uno por uno.
 */
export function useResyncMapping(productId: number, handlers: ResyncHandlers = {}) {
  const queryClient = useQueryClient()
  const mutationKey = [...inventoryKeys.mappings(productId), 'resync']

  const mutation = useMutation<ProductMapping, ApiRequestError, ProductMapping>({
    mutationKey,
    mutationFn: (mapping) => resyncProductMapping(productId, mapping.id),
    onMutate: (mapping) => handlers.onMutate?.(mapping),
    onSuccess: (_accepted, mapping) => {
      handlers.onSuccess?.(mapping)
      return queryClient.invalidateQueries({ queryKey: inventoryKeys.mappings(productId) })
    },
    onError: (error, mapping) => handlers.onError?.(error, mapping),
  })

  const pendingIds = useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: (pending) => (pending.state.variables as ProductMapping | undefined)?.id,
  })

  return { retry: mutation.mutate, pendingIds }
}
