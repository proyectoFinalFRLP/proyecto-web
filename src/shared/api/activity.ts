import { client } from './client'

// Frontera con `GET /api/v1/activity` (TESIS-162): lo último que pasó en la
// empresa, en una lista ya ordenada por fecha. Vive en `shared/` y no en una
// feature porque quien la consume es el header, que está en `app/` y no puede
// importar features (architecture.md §3.2).
//
// No hay estado de leído por usuario: el backend deriva la actividad de lo que
// ya registró, y el badge cuenta lo del período, no «no leídas».

/** Qué pasó. Unión cerrada: un tipo nuevo falla al compilar, no se pinta gris. */
export type ActivityType = 'order_created' | 'shipment_dispatched' | 'event_failed'

interface ApiActivityEntry {
  id: string
  type: ActivityType
  occurred_at: string
  order_id?: number
  customer_name?: string
  external_order_id?: string | null
  total_amount?: number | null
  shipment_id?: number
  tracking_number?: string | null
  courier?: string | null
  failed_event_id?: number
  event_type?: string
  status?: string
  integration?: string | null
}

/**
 * Una entrada del feed. Los campos cambian según el tipo, que es lo que
 * describe cada hecho: una venta tiene cliente, un despacho tiene courier.
 * El componente discrimina por `type`.
 */
export interface ActivityEntry {
  id: string
  type: ActivityType
  occurredAt: string
  orderId: number | null
  customerName: string | null
  /** Null en una venta cargada a mano: es lo que la distingue de una de canal. */
  externalOrderId: string | null
  shipmentId: number | null
  trackingNumber: string | null
  courier: string | null
  eventType: string | null
  integration: string | null
}

function toEntry(entry: ApiActivityEntry): ActivityEntry {
  return {
    id: entry.id,
    type: entry.type,
    occurredAt: entry.occurred_at,
    orderId: entry.order_id ?? null,
    customerName: entry.customer_name ?? null,
    externalOrderId: entry.external_order_id ?? null,
    shipmentId: entry.shipment_id ?? null,
    trackingNumber: entry.tracking_number ?? null,
    courier: entry.courier ?? null,
    eventType: entry.event_type ?? null,
    integration: entry.integration ?? null,
  }
}

export const activityKeys = {
  all: ['activity'] as const,
  list: () => [...activityKeys.all, 'list'] as const,
}

export async function fetchActivity(): Promise<ActivityEntry[]> {
  const { data } = await client.get<{ data: ApiActivityEntry[] }>('/activity')

  return data.data.map(toEntry)
}
