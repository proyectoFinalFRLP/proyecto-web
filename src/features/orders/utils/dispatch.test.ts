import { describe, expect, it } from 'vitest'

import type { OrderLine, OriginWarehouse, Shipment } from '../types'

import {
  canOpenShipment,
  dispatchableShipment,
  originCandidates,
  toOrderQuotePayload,
} from './dispatch'

const PENDING: Shipment = {
  id: 31,
  orderId: 8829,
  status: 'pending',
  trackingNumber: null,
  shippingCost: null,
  courier: null,
  labelUrl: null,
  events: [],
}

function line(id: number, warehouseId: number | null): OrderLine {
  return {
    id,
    productId: 10 + id,
    sku: `SKU-${id}`,
    productName: `Producto ${id}`,
    quantity: 1,
    unitPrice: 1000,
    warehouseId,
  }
}

const EZEIZA: OriginWarehouse = { id: 1, name: 'CD Ezeiza', address: 'Ruta 205', zipCode: '1804' }
const PACHECO: OriginWarehouse = { id: 2, name: 'CD Pacheco', address: 'Ruta 197', zipCode: '1617' }
const WAREHOUSES = [EZEIZA, PACHECO]

describe('dispatchableShipment', () => {
  it('offers a pending shipment that has no tracking number yet', () => {
    expect(dispatchableShipment('pending', { kind: 'single', shipment: PENDING })).toBe(PENDING)
  })

  it('does not offer a shipment that already left', () => {
    const dispatched = { ...PENDING, status: 'ready_to_ship' as const, trackingNumber: 'AND-1' }

    expect(dispatchableShipment('paid', { kind: 'single', shipment: dispatched })).toBeNull()
  })

  // Un envío devuelto a `pending` a mano conserva su número: el backend lo
  // rechaza con 409, así que la pantalla no lo ofrece.
  it('does not offer a pending shipment that kept its tracking number', () => {
    const reverted = { ...PENDING, trackingNumber: 'AND-1' }

    expect(dispatchableShipment('paid', { kind: 'single', shipment: reverted })).toBeNull()
  })

  it('does not offer the shipment of a cancelled order', () => {
    expect(dispatchableShipment('cancelled', { kind: 'single', shipment: PENDING })).toBeNull()
  })

  it('does not offer anything while there is no single shipment to show', () => {
    expect(dispatchableShipment('pending', { kind: 'none' })).toBeNull()
    expect(dispatchableShipment('pending', { kind: 'duplicated', count: 2 })).toBeNull()
    expect(dispatchableShipment('pending', { kind: 'loading' })).toBeNull()
    expect(dispatchableShipment('pending', { kind: 'error', onRetry: () => undefined })).toBeNull()
  })
})

describe('canOpenShipment', () => {
  // El caso que motiva la card: una orden de webhook nace sin envío y hasta
  // TESIS-141 no había forma de abrirlo desde la app.
  it('lets an order with no shipment open one', () => {
    expect(canOpenShipment('paid', { kind: 'none' })).toBe(true)
  })

  it('also lets a pending order open it, like the backend does', () => {
    expect(canOpenShipment('pending', { kind: 'none' })).toBe(true)
  })

  // Misma exclusión que Shipments::CreateShipment::NON_SHIPPABLE_STATUSES.
  it('refuses a cancelled order', () => {
    expect(canOpenShipment('cancelled', { kind: 'none' })).toBe(false)
  })

  it('refuses an order that already has one', () => {
    expect(canOpenShipment('paid', { kind: 'single', shipment: PENDING })).toBe(false)
  })

  // Que el envío no exista tiene que ser un hecho: sobre una consulta que
  // todavía no resolvió o que falló, ofrecerlo invitaría a un 409.
  it('refuses while the shipment is unknown', () => {
    expect(canOpenShipment('paid', { kind: 'loading' })).toBe(false)
    expect(canOpenShipment('paid', { kind: 'error', onRetry: () => undefined })).toBe(false)
    expect(canOpenShipment('paid', { kind: 'duplicated', count: 2 })).toBe(false)
  })
})

describe('originCandidates', () => {
  it('takes the warehouse the lines came out of', () => {
    expect(originCandidates([line(1, 2), line(2, 2)], WAREHOUSES)).toEqual([PACHECO])
  })

  it('leaves the choice to the operator when the lines came out of more than one', () => {
    expect(originCandidates([line(1, 1), line(2, 2)], WAREHOUSES)).toEqual(WAREHOUSES)
  })

  it('offers every warehouse when no line knows where it came from', () => {
    expect(originCandidates([line(1, null)], WAREHOUSES)).toEqual(WAREHOUSES)
  })

  it('ignores a line that does not know its warehouse when another one does', () => {
    expect(originCandidates([line(1, null), line(2, 1)], WAREHOUSES)).toEqual([EZEIZA])
  })

  it('does not deduce the origin from a warehouse the company no longer has', () => {
    expect(originCandidates([line(1, 99)], WAREHOUSES)).toEqual(WAREHOUSES)
  })
})

describe('toOrderQuotePayload', () => {
  it('sends only the origin: the order already knows the destination and the parcel', () => {
    expect(toOrderQuotePayload(2)).toEqual({ quote: { origin_warehouse_id: 2 } })
  })
})
