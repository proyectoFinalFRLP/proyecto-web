import { describe, expect, it } from 'vitest'

import type { Shipment, ShipmentEvent, ShipmentStatus } from '../types'

import {
  buildLifecycle,
  deliveredAt,
  eventsNewestFirst,
  headerStatus,
  lifecycleProgress,
  SHIPMENT_STAGES,
} from './shipment'

let nextEventId = 1

function event(internalStatus: ShipmentStatus, occurredAt: string): ShipmentEvent {
  nextEventId += 1

  return {
    id: nextEventId,
    internalStatus,
    externalStatus: `raw ${internalStatus}`,
    description: null,
    occurredAt,
  }
}

function shipment(status: ShipmentStatus, events: ShipmentEvent[] = []): Shipment {
  return {
    id: 31,
    orderId: 8829,
    status,
    trackingNumber: null,
    shippingCost: null,
    courier: null,
    events,
  }
}

describe('headerStatus', () => {
  it('follows the shipment when the order has one', () => {
    expect(headerStatus('paid', { kind: 'single', shipment: shipment('in_transit') })).toEqual({
      label: 'En tránsito',
      variant: 'info',
    })
  })

  it('says a cancelled order is cancelled, even if its shipment is moving', () => {
    expect(headerStatus('cancelled', { kind: 'single', shipment: shipment('in_transit') })).toEqual(
      { label: 'Cancelada', variant: 'error' },
    )
  })

  it('falls back to the order status while the shipment is not resolved', () => {
    expect(headerStatus('pending', undefined)).toEqual({ label: 'Pendiente', variant: 'neutral' })
  })

  it('says the order has no shipment instead of leaving the badge blank', () => {
    expect(headerStatus('paid', { kind: 'none' })).toEqual({
      label: 'Sin envío',
      variant: 'neutral',
    })
  })

  it('warns about a duplicated shipment', () => {
    expect(headerStatus('paid', { kind: 'duplicated', count: 2 }).variant).toBe('warning')
  })
})

describe('buildLifecycle', () => {
  it('marks the stages behind the current one as done and the ones ahead as pending', () => {
    const states = buildLifecycle(shipment('in_transit')).map((stage) => stage.state)

    expect(states).toEqual(['done', 'done', 'current', 'pending'])
  })

  it('leaves nothing current once the shipment is delivered', () => {
    const states = buildLifecycle(shipment('delivered')).map((stage) => stage.state)

    expect(states).toEqual(['done', 'done', 'done', 'done'])
  })

  // La etapa se fecha con el primer evento: los reintentos del courier repiten
  // el estado y no deben mover la fecha en que el envío entró en ella.
  it('dates each stage with the first event that reports it', () => {
    const stages = buildLifecycle(
      shipment('in_transit', [
        event('pending', '2026-08-12T12:42:00Z'),
        event('in_transit', '2026-08-15T11:30:00Z'),
        event('in_transit', '2026-08-16T09:00:00Z'),
      ]),
    )

    expect(stages.map((stage) => stage.reachedAt)).toEqual([
      '2026-08-12T12:42:00Z',
      null,
      '2026-08-15T11:30:00Z',
      null,
    ])
  })

  // El estado vigente sale del envío y no del último evento, que puede haber
  // llegado desordenado.
  it('takes the current stage from the shipment status, not from the last event', () => {
    const stages = buildLifecycle(
      shipment('ready_to_ship', [event('in_transit', '2026-08-15T11:30:00Z')]),
    )

    expect(stages.find((stage) => stage.state === 'current')?.status).toBe('ready_to_ship')
  })
})

describe('lifecycleProgress', () => {
  it('goes from 0 when just created to 100 when delivered', () => {
    expect(SHIPMENT_STAGES.map(lifecycleProgress)).toEqual([0, 33, 67, 100])
  })
})

describe('deliveredAt', () => {
  it('has no date for a shipment that has not arrived', () => {
    expect(deliveredAt(shipment('in_transit', [event('in_transit', '2026-08-15T11:30:00Z')]))).toBe(
      null,
    )
  })

  it('returns when a delivered shipment arrived', () => {
    expect(
      deliveredAt(
        shipment('delivered', [
          event('in_transit', '2026-08-15T11:30:00Z'),
          event('delivered', '2026-08-26T17:05:00Z'),
        ]),
      ),
    ).toBe('2026-08-26T17:05:00Z')
  })
})

describe('eventsNewestFirst', () => {
  it('puts the latest event first without touching the shipment', () => {
    const events = [
      event('pending', '2026-08-12T12:42:00Z'),
      event('in_transit', '2026-08-15T11:30:00Z'),
    ]
    const source = shipment('in_transit', events)

    expect(eventsNewestFirst(source).map((item) => item.internalStatus)).toEqual([
      'in_transit',
      'pending',
    ])
    // El envío viene de la caché de React Query: invertirlo en el lugar
    // cambiaría el orden para cualquier otro que lo lea.
    expect(source.events.map((item) => item.internalStatus)).toEqual(['pending', 'in_transit'])
  })
})
