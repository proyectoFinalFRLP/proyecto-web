import type { StatusVariant } from 'shared/components'

import type { FailedEventDirection, FailedEventStatus } from './types'

// Copy centralizado de la feature — sin literales sueltos en el JSX.

const numberFormat = new Intl.NumberFormat('es-AR')

export function formatCount(value: number): string {
  return numberFormat.format(value)
}

/**
 * Nombre legible de cada tipo de evento (`Webhooks::ReplayRegistry`). Un tipo
 * que no está acá se muestra tal cual: es mejor un nombre técnico que
 * esconder que existe.
 */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  'integrations.http_request': 'Pedido a un canal o courier',
  'webhooks.order_ingestion': 'Venta recibida de un canal',
  'webhooks.tracking_ingestion': 'Novedad de seguimiento de un envío',
}

export const STATUS_LABELS: Record<FailedEventStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  succeeded: 'Resuelto',
  dead: 'Agotado',
  discarded: 'Descartado',
}

/** El color nunca va solo: el badge siempre lleva el texto del estado. */
export const STATUS_VARIANTS: Record<FailedEventStatus, StatusVariant> = {
  pending: 'warning',
  processing: 'info',
  succeeded: 'success',
  dead: 'error',
  discarded: 'neutral',
}

export const DIRECTION_LABELS: Record<FailedEventDirection, string> = {
  inbound: 'Entrante',
  outbound: 'Saliente',
}

export const failedEventsCopy = {
  page: {
    title: 'Eventos fallidos',
    subtitle:
      'Webhooks y sincronizaciones que fallaron. El sistema los reintenta solo; acá podés forzar un reintento o descartarlos.',
    tableLabel: 'Cola de eventos fallidos',
    empty: 'No hay eventos en esta pestaña.',
    error: 'No pudimos cargar la cola de eventos.',
  },
  tabs: {
    all: 'Todos',
    pending: 'Pendientes',
    dead: 'Agotados',
    succeeded: 'Resueltos',
    discarded: 'Descartados',
  },
  columns: {
    event: 'Evento',
    status: 'Estado',
    attempts: 'Intentos',
    nextRetry: 'Próximo reintento',
    lastError: 'Último error',
    createdAt: 'Registrado',
    actions: 'Acciones',
  },
  cells: {
    attempts: (attempts: number, max: number) => `${attempts} / ${max}`,
    noRetry: '—',
    noError: 'Sin detalle',
    httpStatus: (status: number) => `HTTP ${status}`,
    /** Si el reintento ya venció, el barrido lo toma en el próximo minuto. */
    due: 'En la próxima vuelta',
  },
  actions: {
    retry: 'Reintentar',
    discard: 'Descartar',
    retryFor: (id: number) => `Reintentar el evento ${id}`,
    discardFor: (id: number) => `Descartar el evento ${id}`,
  },
  discard: {
    title: 'Descartar evento',
    body: (label: string) =>
      `«${label}» deja de reintentarse. Si la causa ya se resolvió, conviene reintentarlo en vez de descartarlo.`,
    confirm: 'Descartar',
    cancel: 'Volver',
    close: 'Cerrar',
  },
  feedback: {
    retried: 'El evento volvió a la cola y se reintenta ahora.',
    discarded: 'Evento descartado.',
    notRequeueable:
      'Ese evento ya no admite reintento: cambió de estado. La tabla está actualizada.',
    failed: 'No pudimos actualizar el evento. Probá de nuevo.',
  },
  pagination: {
    previous: 'Página anterior',
    next: 'Página siguiente',
    page: (page: number) => `Ir a la página ${page}`,
    summary: (from: number, to: number, total: number) =>
      `Mostrando ${from} a ${to} de ${formatCount(total)} ${total === 1 ? 'evento' : 'eventos'}`,
  },
}
