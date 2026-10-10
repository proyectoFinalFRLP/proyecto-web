import { describe, expect, it } from 'vitest'

import type { FailedEvent } from '../types'

import { actionsFor, eventLabel } from './actions'

const EVENT: FailedEvent = {
  id: 1,
  eventType: 'webhooks.order_ingestion',
  direction: 'inbound',
  status: 'dead',
  attempts: 5,
  maxAttempts: 5,
  nextRetryAt: null,
  lastError: 'timeout',
  lastResponseStatus: 504,
  createdAt: '2026-10-01T10:00:00Z',
}

// Espejo de `RequeueFailedEvent::REQUEUEABLE_STATUSES`: ofrecer lo que la API
// rechaza con 422 sería prometer algo que no pasa.
describe('actionsFor', () => {
  it('offers retrying and discarding an exhausted event', () => {
    expect(actionsFor('dead')).toEqual(['retry', 'discard'])
  })

  it('lets a discarded event come back, but not be discarded twice', () => {
    expect(actionsFor('discarded')).toEqual(['retry'])
  })

  it('offers nothing for an event that already went through', () => {
    expect(actionsFor('succeeded')).toEqual([])
  })

  // La API lo acepta sólo con el claim vencido, y eso el front no lo ve.
  it('does not offer retrying an event a worker is processing', () => {
    expect(actionsFor('processing')).not.toContain('retry')
  })
})

describe('eventLabel', () => {
  it('names the known event types in words', () => {
    expect(eventLabel(EVENT)).toBe('Venta recibida de un canal')
  })

  it('shows an unknown type as it comes instead of hiding it', () => {
    expect(eventLabel({ ...EVENT, eventType: 'webhooks.something_new' })).toBe(
      'webhooks.something_new',
    )
  })
})
