import { describe, expect, it } from 'vitest'

import type { WarehouseLoad } from '../types'

import { totalStoredUnits, warehouseShares } from './capacity'

function warehouse(
  id: number,
  name: string,
  storedUnits: number,
  capacity: number | null = null,
): WarehouseLoad {
  return { id, name, storedUnits, capacity }
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

// TESIS-162: con capacidad declarada la barra deja de comparar depósitos y
// pasa a medir ocupación.
describe('warehouseShares with a declared capacity', () => {
  it('measures the warehouse against its own capacity', () => {
    const shares = warehouseShares([warehouse(1, 'Norte', 300, 1_000)])

    expect(shares[0]).toMatchObject({ share: 30, measuredAgainstCapacity: true })
  })

  // Un depósito pasado de su techo está lleno, no 140 % lleno.
  it('caps a warehouse that holds more than it declared', () => {
    const shares = warehouseShares([warehouse(1, 'Norte', 1_400, 1_000)])

    expect(shares[0].share).toBe(100)
  })

  // Una empresa puede haber declarado unos y otros no.
  it('keeps comparing the ones that declared nothing against the fullest', () => {
    const shares = warehouseShares([
      warehouse(1, 'Norte', 200, 1_000),
      warehouse(2, 'Sur', 50),
      warehouse(3, 'Centro', 100),
    ])

    expect(shares.find((w) => w.name === 'Norte')).toMatchObject({
      share: 20,
      measuredAgainstCapacity: true,
    })
    expect(shares.find((w) => w.name === 'Sur')).toMatchObject({
      share: 25,
      measuredAgainstCapacity: false,
    })
  })
})

// Un techo en cero no define ninguna ocupación, y `0 / 0` daría `NaN` en el
// ancho de la barra.
describe('warehouseShares with a capacity of zero', () => {
  it('does not turn the bar into NaN', () => {
    const shares = warehouseShares([warehouse(1, 'Norte', 0, 0)])

    expect(Number.isFinite(shares[0].share)).toBe(true)
    expect(shares[0].share).toBe(0)
  })

  // Sin techo utilizable la barra vuelve a comparar contra el más cargado, y
  // el rótulo tiene que decir eso y no «% de su capacidad».
  it('measures it against the fullest warehouse instead', () => {
    const shares = warehouseShares([warehouse(1, 'Norte', 50, 0), warehouse(2, 'Sur', 100)])

    expect(shares.find((w) => w.name === 'Norte')).toMatchObject({
      share: 50,
      measuredAgainstCapacity: false,
    })
  })
})
