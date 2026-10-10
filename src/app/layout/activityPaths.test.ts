import type { ActivityEntry } from 'shared/api/activity'
import { activityPath } from 'shared/components/ActivityPanel/entry'
import { describe, expect, it } from 'vitest'

import { ACTIVITY_PATHS } from './activityPaths'

// `ActivityPanel` vive en `shared/` y no puede importar el router, así que los
// destinos los pone quien lo monta: el Header. Entre TESIS-147 y TESIS-171 la
// pantalla de eventos fallidos existía y el Header no pasaba su ruta, así que
// la fila del evento caído se dibujaba sin enlazar. Ningún test lo veía: los de
// `ActivityPanel` le pasan las rutas a mano.
function entry(overrides: Partial<ActivityEntry> = {}): ActivityEntry {
  return {
    id: 'event-1',
    type: 'event_failed',
    occurredAt: '2026-10-02T14:20:00Z',
    orderId: null,
    customerName: null,
    externalOrderId: null,
    shipmentId: null,
    trackingNumber: null,
    courier: null,
    eventType: 'orders/create',
    integration: 'Shopify',
    ...overrides,
  }
}

describe('ACTIVITY_PATHS', () => {
  it('sends a failed event to the queue that shows it', () => {
    expect(activityPath(entry(), ACTIVITY_PATHS)).toBe('/failed-events')
  })

  it('sends a sale to the detail of its order', () => {
    expect(activityPath(entry({ type: 'order_created', orderId: 8829 }), ACTIVITY_PATHS)).toBe(
      '/orders/8829',
    )
  })
})
