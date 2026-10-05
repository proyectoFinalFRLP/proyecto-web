import { EVENT_TYPE_LABELS } from '../content'
import type { FailedEvent, FailedEventAction, FailedEventStatus } from '../types'

// Qué acciones acepta la API en cada estado. Es la regla de
// `Webhooks::RequeueFailedEvent::REQUEUEABLE_STATUSES` vista desde la pantalla:
// ofrecer un botón que la API va a rechazar con 422 es prometer algo que no
// pasa.
//
// `processing` no ofrece reintento: la API lo acepta sólo si el claim del
// worker venció, y eso el front no lo puede saber. Si quedó colgado, el barrido
// del cronjob lo rescata solo; si no, el operador lo puede descartar.
const ACTIONS: Record<FailedEventStatus, readonly FailedEventAction[]> = {
  pending: ['retry', 'discard'],
  processing: ['discard'],
  dead: ['retry', 'discard'],
  discarded: ['retry'],
  succeeded: [],
}

export function actionsFor(status: FailedEventStatus): readonly FailedEventAction[] {
  return ACTIONS[status]
}

/** Nombre legible del tipo de evento, o el tipo tal cual si no se conoce. */
export function eventLabel(event: FailedEvent): string {
  return EVENT_TYPE_LABELS[event.eventType] ?? event.eventType
}
