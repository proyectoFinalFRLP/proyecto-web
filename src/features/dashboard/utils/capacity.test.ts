import { describe, expect, it } from 'vitest'

import type { WarehouseLoad } from '../types'

import { totalStoredUnits, warehouseShares } from './capacity'

function warehouse(id: number, name: string, storedUnits: number): WarehouseLoad {
  return { id, name, storedUnits }
}

describe('warehouseShares', () => {
  it('gives the fullest warehouse the whole bar', () => {
    const shares = warehouseShares([warehouse(1, 'Norte', 200), warehouse(2, 'Sur', 50)])

    expect(shares[0]).toMatchObject({ name: 'Norte', share: 100 })
  })

  // Es lo que la barra significa: no ocupación, sino cuánto guarda este
  // depósito comparado con el que más guarda.
  it('measures the rest against that one and not against a capacity', () => {
    const shares = warehouseShares([warehouse(1, 'Norte', 200), warehouse(2, 'Sur', 50)])

    expect(shares[1]).toMatchObject({ name: 'Sur', share: 25 })
  })

  it('orders them from fullest to emptiest, whatever order they arrived in', () => {
    const shares = warehouseShares([
      warehouse(1, 'Sur', 50),
      warehouse(2, 'Norte', 200),
      warehouse(3, 'Oeste', 120),
    ])

    expect(shares.map((share) => share.name)).toEqual(['Norte', 'Oeste', 'Sur'])
  })

  // Sin esto la división por el máximo da NaN y las barras se rompen.
  it('leaves every bar at zero when no warehouse holds anything', () => {
    const shares = warehouseShares([warehouse(1, 'Norte', 0), warehouse(2, 'Sur', 0)])

    expect(shares.map((share) => share.share)).toEqual([0, 0])
  })

  it('survives a company with no warehouses at all', () => {
    expect(warehouseShares([])).toEqual([])
  })

  it('does not reorder the array it was given', () => {
    const warehouses = [warehouse(1, 'Sur', 50), warehouse(2, 'Norte', 200)]

    warehouseShares(warehouses)

    expect(warehouses.map((each) => each.name)).toEqual(['Sur', 'Norte'])
  })
})

describe('totalStoredUnits', () => {
  it('adds up what every warehouse holds', () => {
    expect(totalStoredUnits([warehouse(1, 'Norte', 200), warehouse(2, 'Sur', 50)])).toBe(250)
  })

  it('is zero with no warehouses', () => {
    expect(totalStoredUnits([])).toBe(0)
  })
})
