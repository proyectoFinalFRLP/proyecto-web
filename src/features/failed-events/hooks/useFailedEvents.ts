import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import { actOnFailedEvent, fetchFailedEventCount, fetchFailedEventPage } from '../api'
import { failedEventKeys } from '../queryKeys'
import type {
  FailedEvent,
  FailedEventAction,
  FailedEventFilters,
  FailedEventPage,
  FailedEventStatus,
} from '../types'

/**
 * Las pestañas, en orden, con el estado que filtra cada una. `processing` no
 * tiene pestaña: es un estado de segundos mientras un worker lo intenta, y
 * aparece igual en «Todos».
 */
export const QUEUE_TABS = [
  { id: 'all', status: undefined },
  { id: 'pending', status: 'pending' },
  { id: 'dead', status: 'dead' },
  { id: 'succeeded', status: 'succeeded' },
  { id: 'discarded', status: 'discarded' },
] as const satisfies readonly { id: string; status: FailedEventStatus | undefined }[]

export type QueueTabId = (typeof QUEUE_TABS)[number]['id']

/** Status con el que la API rechaza reintentar un evento que no admite reintento. */
export const NOT_REQUEUEABLE_STATUS = 422

export function useFailedEventPage(filters: FailedEventFilters) {
  return useQuery<FailedEventPage>({
    queryKey: failedEventKeys.page(filters),
    queryFn: () => fetchFailedEventPage(filters),
    // Cambiar de página o de pestaña no vacía la tabla mientras responde la API.
    placeholderData: keepPreviousData,
  })
}

/** Los contadores de las pestañas, en paralelo. Uno que falla deja la pestaña sin número. */
export function useFailedEventCounts() {
  return useQueries({
    queries: QUEUE_TABS.map(({ status }) => ({
      queryKey: failedEventKeys.count(status),
      queryFn: () => fetchFailedEventCount(status),
    })),
    combine: (results) => results.map((result) => result.data),
  })
}

/**
 * Reintento o descarte. Invalida la feature también al fallar: el caso real de
 * error es un evento que cambió de estado mientras la tabla estaba abierta (el
 * barrido lo resolvió, otro operador lo descartó), y la fila tiene que
 * mostrarlo.
 */
export function useFailedEventAction() {
  const queryClient = useQueryClient()

  return useMutation<FailedEvent, ApiRequestError, { id: number; action: FailedEventAction }>({
    mutationFn: ({ id, action }) => actOnFailedEvent(id, action),
    onSettled: () => queryClient.invalidateQueries({ queryKey: failedEventKeys.all }),
  })
}
