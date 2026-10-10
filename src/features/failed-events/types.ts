// Tipos de la cola de eventos fallidos (Dead Letter Queue), en camelCase.

/** `FailedEvent::STATUSES`. */
export type FailedEventStatus = 'pending' | 'processing' | 'succeeded' | 'dead' | 'discarded'

/** Entrante (un webhook que nos llegó) o saliente (un pedido nuestro a un tercero). */
export type FailedEventDirection = 'inbound' | 'outbound'

/**
 * Un evento de integración que falló y espera, o esperó, un reintento.
 * Espejo de `GET /api/v1/failed-events`. Sin `payload` ni cuerpo de la
 * respuesta: la API no los expone porque pueden traer datos del cliente.
 */
export interface FailedEvent {
  id: number
  eventType: string
  direction: FailedEventDirection
  status: FailedEventStatus
  attempts: number
  maxAttempts: number
  /** `null` cuando ya no se va a reintentar solo (resuelto, agotado, descartado). */
  nextRetryAt: string | null
  lastError: string | null
  lastResponseStatus: number | null
  createdAt: string
}

export interface FailedEventFilters {
  page: number
  perPage: number
  /** Sin estado, la API devuelve todos. */
  status?: FailedEventStatus
}

export interface FailedEventPage {
  events: FailedEvent[]
  page: number
  perPage: number
  total: number
}

export type FailedEventAction = 'retry' | 'discard'
