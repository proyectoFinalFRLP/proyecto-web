import { describe, expect, it } from 'vitest'

import type { Shipment } from '../types'

import { cancellableOrder } from './cancel'

const SHIPMENT: Shipment = {
  id: 1,
  orderId: 9,
  status: 'pending',
  trackingNumber: null,
  shippingCost: null,
  courier: null,
  events: [],
}

// Espejo de `Orders::CancelOrder#ensure_cancellable!`.
describe('cancellableOrder', () => {
  it('lets an order without a shipment be cancelled', () => {
    expect(cancellableOrder('pending', { kind: 'none' })).toBe(true)
  })

  it('lets an order be cancelled while its shipment has not left', () => {
    expect(cancellableOrder('paid', { kind: 'single', shipment: SHIPMENT })).toBe(true)
  })

  it('refuses an order already cancelled', () => {
    expect(cancellableOrder('cancelled', { kind: 'none' })).toBe(false)
  })

  it('refuses an order whose shipment is on its way', () => {
    const shipment = { ...SHIPMENT, status: 'in_transit' as const }

    expect(cancellableOrder('paid', { kind: 'single', shipment })).toBe(false)
  })

  // Despachado y vuelto a `pending` a mano: el número delata que salió.
  it('refuses a pending shipment that already has a tracking number', () => {
    const shipment = { ...SHIPMENT, trackingNumber: 'AND-1' }

    expect(cancellableOrder('paid', { kind: 'single', shipment })).toBe(false)
  })

  it('does not offer it while it is not known whether the shipment left', () => {
    expect(cancellableOrder('paid', { kind: 'loading' })).toBe(false)
    expect(cancellableOrder('paid', { kind: 'error', onRetry: () => undefined })).toBe(false)
  })
})
