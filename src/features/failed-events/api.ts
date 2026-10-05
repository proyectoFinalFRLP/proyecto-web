import { client } from 'shared/api/client'

import type {
  FailedEvent,
  FailedEventAction,
  FailedEventDirection,
  FailedEventFilters,
  FailedEventPage,
  FailedEventStatus,
} from './types'

// Frontera con `/api/v1/failed-events`. Ningún componente ve el snake_case.

interface ApiFailedEvent {
  id: number
  event_type: string
  direction: FailedEventDirection
  status: FailedEventStatus
  attempts: number
  max_attempts: number
  next_retry_at: string | null
  last_error: string | null
  last_response_status: number | null
  created_at: string
}

interface ApiList<T> {
  data: T[]
  meta: { page: number; per_page: number; total: number }
}

function toFailedEvent(event: ApiFailedEvent): FailedEvent {
  return {
    id: event.id,
    eventType: event.event_type,
    direction: event.direction,
    status: event.status,
    attempts: event.attempts,
    maxAttempts: event.max_attempts,
    nextRetryAt: event.next_retry_at,
    lastError: event.last_error,
    lastResponseStatus: event.last_response_status,
    createdAt: event.created_at,
  }
}

// Sin estado no viaja `status=`: la API ignora un estado desconocido, pero uno
// vacío no es "todos" por contrato, es por casualidad.
function toParams({ page, perPage, status }: FailedEventFilters) {
  return { page, per_page: perPage, ...(status === undefined ? {} : { status }) }
}

export async function fetchFailedEventPage(filters: FailedEventFilters): Promise<FailedEventPage> {
  const { data } = await client.get<ApiList<ApiFailedEvent>>('/failed-events', {
    params: toParams(filters),
  })

  return {
    events: data.data.map(toFailedEvent),
    page: data.meta.page,
    perPage: data.meta.per_page,
    total: data.meta.total,
  }
}

/** Cuántos eventos hay en un estado, sin traerlos: una fila y el `meta.total`. */
export async function fetchFailedEventCount(status?: FailedEventStatus): Promise<number> {
  const { data } = await client.get<ApiList<ApiFailedEvent>>('/failed-events', {
    params: toParams({ page: 1, perPage: 1, status }),
  })

  return data.meta.total
}

/**
 * Reintento o descarte manual. El reintento vuelve el evento a `pending` con
 * los intentos en cero y lo encola ya, sin esperar al barrido; responde **422**
 * si el evento no se puede reintentar (resuelto, o en proceso con un worker
 * vivo). El descarte lo saca de la cola para siempre.
 */
export async function actOnFailedEvent(
  id: number,
  action: FailedEventAction,
): Promise<FailedEvent> {
  const { data } = await client.post<ApiFailedEvent>(`/failed-events/${id}/${action}`)

  return toFailedEvent(data)
}
