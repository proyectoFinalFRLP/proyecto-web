import type { ActivityEntry, ActivityType } from '../../api/activity'

import { activityContent } from './content'

// Cómo se lee y a dónde lleva cada hecho del feed. Fuera del componente para
// poder probarlo sin montar el panel, mismo criterio que las reglas de las
// features (TESIS-163).

/**
 * La frase de una entrada.
 *
 * Se arma acá y no en el backend: la API manda el hecho y sus datos, y el texto
 * es decisión de la pantalla. Mapa explícito por tipo y no un `switch` con
 * default: si el backend suma un tipo, el compilador marca este archivo en vez
 * de dejarlo sin texto.
 */
const LABELS: Record<ActivityType, (entry: ActivityEntry) => string> = {
  order_created: (entry) => {
    const customer = entry.customerName ?? ''
    return entry.externalOrderId === null
      ? activityContent.orderCreated.manual(customer)
      : activityContent.orderCreated.channel(customer, entry.externalOrderId)
  },
  shipment_dispatched: (entry) =>
    entry.courier === null
      ? activityContent.shipmentDispatched.withoutCourier
      : activityContent.shipmentDispatched.withCourier(entry.courier),
  event_failed: (entry) =>
    entry.integration === null
      ? activityContent.eventFailed.withoutIntegration
      : activityContent.eventFailed.withIntegration(entry.integration),
}

export function activityLabel(entry: ActivityEntry): string {
  return LABELS[entry.type](entry)
}

/**
 * A dónde lleva la fila, o null si no hay a dónde.
 *
 * Una venta y un despacho llevan a la orden, porque el envío vive en su
 * detalle. Las rutas llegan desde afuera: `shared/` no puede importar el router
 * (architecture.md §3.2).
 *
 * `failedEvents` es opcional porque esa pantalla todavía no existe (la trae
 * TESIS-147). Sin ella la fila se muestra igual y no enlaza, en vez de llevar a
 * una ruta que el catch-all redirige al panel: el hecho importa aunque no haya
 * a dónde ir a verlo. Cuando la pantalla entre, alcanza con pasar la ruta.
 */
export function activityPath(
  entry: ActivityEntry,
  paths: { order: (id: number) => string; failedEvents?: string },
): string | null {
  if (entry.type === 'event_failed') return paths.failedEvents ?? null
  return entry.orderId === null ? null : paths.order(entry.orderId)
}
