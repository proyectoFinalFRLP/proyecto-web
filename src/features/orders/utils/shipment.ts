import type { StatusVariant } from 'shared/components'
import { lookup } from 'shared/utils'

import { ordersCopy } from '../content'
import type { OrderShipment, OrderStatus, Shipment, ShipmentStatus } from '../types'

import { statusLabel, statusVariant } from './status'

// Reglas del ciclo de vida del envío que muestra el detalle de la orden. Viven
// acá y no en los componentes para poder probarlas sin montar la pantalla.

/**
 * Los esquemas que puede tener el enlace de la etiqueta para que la pantalla lo
 * abra. Es una lista blanca y no una lista negra: lo que no sea una dirección
 * web no se pinta como enlace.
 */
const PRINTABLE_SCHEMES = ['https:', 'http:']

/**
 * El enlace a la etiqueta, o null si no hay uno que se pueda abrir.
 *
 * La URL no la escribe el OMS: la devuelve el courier y la plantilla la mapea
 * tal cual (`'etiqueta.url' => 'shipping_label_url'`). Ponerla en un `href` sin
 * mirarla deja que un proveedor —o alguien que le entre la respuesta— decida
 * qué ejecuta el navegador del operador: `javascript:` en un `href` corre al
 * hacer clic. Acotarlo a http(s) cierra eso sin pedirle nada al backend.
 *
 * Un valor que no se puede abrir no se muestra roto: el campo queda como si no
 * hubiera etiqueta, que es la verdad desde donde está parado el operador.
 */
export function printableLabel(url: string | null | undefined): string | null {
  if (url === null || url === undefined || url.trim() === '') return null

  try {
    return PRINTABLE_SCHEMES.includes(new URL(url).protocol) ? url : null
  } catch {
    // No es una URL absoluta: una relativa no sirve, porque el destino es el
    // sitio del courier y no el nuestro.
    return null
  }
}

const NOT_FOUND_STATUS = 404
const BAD_GATEWAY_STATUS = 502
// Los avisa el cliente HTTP (sesión vencida, sin permiso): un segundo aviso
// diría lo mismo con otras palabras.
const NOTIFIED_BY_CLIENT = [401, 403]

/**
 * El aviso cuando no se pudo traer la etiqueta (TESIS-187), según el status
 * con el que contestó la API. Null cuando ya lo avisó el cliente HTTP.
 */
export function labelErrorMessage(status: number | undefined): string | null {
  if (status !== undefined && NOTIFIED_BY_CLIENT.includes(status)) return null

  const { errors } = ordersCopy.detail.shipping.label
  if (status === NOT_FOUND_STATUS) return errors.notFound
  if (status === BAD_GATEWAY_STATUS) return errors.courier
  return errors.failed
}

// Lo que no puede ir en el nombre de un archivo en ningún sistema: separadores
// de carpeta, comodines, comillas y caracteres de control.
// eslint-disable-next-line no-control-regex
const UNSAFE_FILE_NAME = /[\\/:*?"<>|\u0000-\u001f]+/g

function safeFileName(name: string): string | null {
  const cleaned = name.replace(UNSAFE_FILE_NAME, '-').trim()
  return cleaned === '' || cleaned === '.' || cleaned === '..' ? null : cleaned
}

/**
 * El nombre de archivo de un `Content-Disposition`, o null si no trae uno.
 *
 * Prefiere `filename*` (RFC 6266, en UTF-8 y con escapes `%`), que es el que
 * lleva tildes, y si no `filename`, con comillas o sin ellas. Lo que llega se
 * limpia: viene de la red, y un `../` en el nombre no tiene que llegar al
 * diálogo de guardado.
 */
export function fileNameFromDisposition(header: string): string | null {
  const extended = /filename\*\s*=\s*[^']*'[^']*'([^;]+)/i.exec(header)
  if (extended !== null) {
    try {
      return safeFileName(decodeURIComponent(extended[1].trim()))
    } catch {
      // Un escape roto: se prueba con el `filename` común.
    }
  }

  const plain = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i.exec(header)
  if (plain === null) return null

  return safeFileName(plain[1] ?? plain[2])
}

/**
 * Con qué nombre se guarda la etiqueta (TESIS-188): el que sugiere la API o,
 * si no llegó, `etiqueta-<seguimiento>.pdf`. Antes el PDF se guardaba con el
 * UUID de la URL `blob:`, que no le dice nada a quien lo busca en Descargas.
 */
export function labelFileName(
  shipment: Pick<Shipment, 'id' | 'trackingNumber'>,
  suggested: string | null,
): string {
  if (suggested !== null) return suggested

  const tracking = shipment.trackingNumber === null ? null : safeFileName(shipment.trackingNumber)
  return ordersCopy.detail.shipping.label.fileName(tracking ?? `envio-${shipment.id}`)
}

/** Las etapas del ciclo, en orden. Es el mismo vocabulario que `Shipment::STATUSES`. */
export const SHIPMENT_STAGES: readonly ShipmentStatus[] = [
  'pending',
  'ready_to_ship',
  'in_transit',
  'delivered',
]

/**
 * Los finales sin entrega (TESIS-188): el envío termina ahí, desde cualquier
 * etapa, y no sigue. No son etapas del ciclo: no hay un «después» de ellos.
 */
export const CLOSED_SHIPMENT_STATUSES: readonly ShipmentStatus[] = ['returned', 'cancelled']

/** ¿El envío terminó sin entregarse? */
export function closedWithoutDelivery(status: ShipmentStatus): boolean {
  return CLOSED_SHIPMENT_STATUSES.includes(status)
}

// Mapas explícitos por el mismo motivo que en `status.ts`: si el tipo suma un
// estado, el compilador marca este archivo. Si lo suma la API antes que el
// tipo, `lookup` lo muestra como desconocido en vez de reventar.
//
// Devuelto va en neutro: el ciclo se cerró y no hay nada que hacer con él.
// Cancelado va en error, como la orden cancelada: es lo que pide atención.
const VARIANTS: Record<ShipmentStatus, StatusVariant> = {
  pending: 'neutral',
  ready_to_ship: 'info',
  in_transit: 'info',
  delivered: 'success',
  returned: 'neutral',
  cancelled: 'error',
}

const LABELS: Record<ShipmentStatus, string> = ordersCopy.shipmentStatus

export function shipmentStatusLabel(status: ShipmentStatus): string {
  return lookup(LABELS, status, ordersCopy.shipmentStatusUnknown)
}

export function shipmentStatusVariant(status: ShipmentStatus): StatusVariant {
  return lookup(VARIANTS, status, 'neutral')
}

export interface HeaderStatus {
  label: string
  variant: StatusVariant
}

/**
 * El badge principal del encabezado.
 *
 * La card lo pide basado en el estado del envío, con dos excepciones:
 *
 * · Una orden cancelada muestra «Cancelada» aunque tenga envío. Es lo único
 *   que importa de ella, y un «En tránsito» al lado diría lo contrario.
 * · Mientras el envío no resolvió (o no se pudo leer) se muestra el estado de
 *   la orden, que ya está: un badge vacío hace saltar el título.
 */
export function headerStatus(
  orderStatus: OrderStatus,
  shipment: OrderShipment | undefined,
): HeaderStatus {
  if (orderStatus === 'cancelled' || shipment === undefined) {
    return { label: statusLabel(orderStatus), variant: statusVariant(orderStatus) }
  }

  switch (shipment.kind) {
    case 'none':
      return { label: ordersCopy.detail.header.noShipment, variant: 'neutral' }
    case 'duplicated':
      return { label: ordersCopy.detail.header.duplicatedShipment, variant: 'warning' }
    case 'single':
      return {
        label: shipmentStatusLabel(shipment.shipment.status),
        variant: shipmentStatusVariant(shipment.shipment.status),
      }
  }
}

/**
 * `closed` es el final sin entrega (devuelto, cancelado): el envío está ahí y
 * ahí se queda, así que no es `current` (no sigue) ni `done` (no se cumplió).
 */
export type StageState = 'done' | 'current' | 'pending' | 'closed'

export interface LifecycleStage {
  status: ShipmentStatus
  state: StageState
  /** Cuándo el envío llegó a esta etapa, o null si todavía no llegó. */
  reachedAt: string | null
}

function firstReachedAt(shipment: Shipment, status: ShipmentStatus): string | null {
  return shipment.events.find((event) => event.internalStatus === status)?.occurredAt ?? null
}

/**
 * El ciclo de un envío que no está en ninguna etapa: terminó sin entregarse
 * (TESIS-188) o la API mandó un estado que el front todavía no conoce.
 *
 * Se muestran las etapas que recorrió —hasta la más avanzada que reporta la
 * bitácora; `pending` siempre, porque todo envío nace ahí— y después el estado
 * en el que quedó. Las que nunca va a recorrer no se dibujan: un «Entregado
 * · Pendiente» al lado de un «Devuelto» prometería un paso que no va a pasar.
 */
function closedLifecycle(shipment: Shipment): LifecycleStage[] {
  const furthest = Math.max(
    0,
    ...shipment.events.map((event) => SHIPMENT_STAGES.indexOf(event.internalStatus)),
  )
  const travelled = SHIPMENT_STAGES.slice(0, furthest + 1).map((status) => ({
    status,
    state: 'done' as const,
    reachedAt: firstReachedAt(shipment, status),
  }))

  // Uno desconocido no se afirma como final: se lo muestra como vigente.
  const state: StageState = closedWithoutDelivery(shipment.status) ? 'closed' : 'current'
  return [
    ...travelled,
    { status: shipment.status, state, reachedAt: firstReachedAt(shipment, shipment.status) },
  ]
}

/**
 * Las cuatro etapas del ciclo con su estado y su fecha.
 *
 * La etapa vigente es la del `status` del envío, no la del último evento: el
 * status es lo que el backend considera verdad, y un evento puede llegar
 * desordenado. La fecha de cada etapa es la del **primer** evento que la
 * reporta, que es cuando el envío entró en ella; los reintentos del courier
 * repiten el estado y no la mueven.
 *
 * Una vez entregado no queda nada por hacer: la última etapa se marca como
 * completa y no como vigente. Devuelto o cancelado, ver `closedLifecycle`.
 */
export function buildLifecycle(shipment: Shipment): LifecycleStage[] {
  const currentIndex = SHIPMENT_STAGES.indexOf(shipment.status)
  if (currentIndex === -1) return closedLifecycle(shipment)

  const finished = shipment.status === 'delivered'

  return SHIPMENT_STAGES.map((status, index) => {
    let state: StageState = 'pending'
    if (index < currentIndex || (finished && index === currentIndex)) state = 'done'
    else if (index === currentIndex) state = 'current'

    return { status, state, reachedAt: firstReachedAt(shipment, status) }
  })
}

/**
 * Avance del ciclo, 0-100: cuántas etapas quedaron atrás sobre las que hay que
 * recorrer. Recién creado es 0 y entregado es 100.
 *
 * Devuelto o cancelado también es 100: el ciclo terminó, aunque no en la
 * entrega (la barra lo dice con el tono, ver `shipmentStatusVariant`). Un
 * estado desconocido es 0: no hay con qué medir cuánto avanzó.
 */
export function lifecycleProgress(status: ShipmentStatus): number {
  if (closedWithoutDelivery(status)) return 100

  const index = SHIPMENT_STAGES.indexOf(status)
  if (index === -1) return 0

  return Math.round((index / (SHIPMENT_STAGES.length - 1)) * 100)
}

/**
 * La entrega, para la métrica del encabezado.
 *
 * La card la pide «extraída del último evento programado», pero la bitácora
 * sólo registra lo que ya pasó (`occurred_at`). Lo único cierto es la fecha de
 * entrega de un envío que ya llegó; antes de eso, la métrica muestra la fecha
 * comprometida que guardó el despacho, si la hay (ver `deliveryMetric` en el
 * detalle).
 */
export function deliveredAt(shipment: Shipment): string | null {
  if (shipment.status !== 'delivered') return null

  return shipment.events.find((event) => event.internalStatus === 'delivered')?.occurredAt ?? null
}

/**
 * La bitácora para el feed, de la más reciente a la más vieja: lo último que
 * pasó es lo primero que se busca. La API la entrega en orden cronológico.
 */
export function eventsNewestFirst(shipment: Shipment): Shipment['events'] {
  return [...shipment.events].reverse()
}
