import type { Product } from '../types'

/**
 * Qué cambió en el producto entre que el modal lo abrió y el servidor lo
 * rechazó por versión vieja.
 *
 * Existe para que el conflicto no sea sólo "alguien lo tocó": el usuario tiene
 * que poder decidir si pisa o no, y para eso necesita saber qué se movió. Sólo
 * compara los campos que el modal edita — el resto no participa de la versión.
 */
export function describeConflict(
  before: Product,
  after: Product,
  labels: {
    name: string
    weight: string
    dimensions: string
    stockIn: (warehouse: string) => string
  },
): string[] {
  const changes: string[] = []

  if (before.name !== after.name) changes.push(`${labels.name}: ${before.name} → ${after.name}`)
  if (before.weight !== after.weight) {
    changes.push(`${labels.weight}: ${before.weight} → ${after.weight}`)
  }
  if (before.dimensions !== after.dimensions) {
    changes.push(`${labels.dimensions}: ${before.dimensions ?? '—'} → ${after.dimensions ?? '—'}`)
  }

  return changes.concat(stockChanges(before, after, labels.stockIn))
}

function stockChanges(
  before: Product,
  after: Product,
  label: (warehouse: string) => string,
): string[] {
  const previous = new Map(before.stocks.map((stock) => [stock.warehouseId, stock]))
  const current = new Map(after.stocks.map((stock) => [stock.warehouseId, stock]))
  const warehouseIds = new Set([...previous.keys(), ...current.keys()])

  return [...warehouseIds].flatMap((id) => {
    const was = previous.get(id)
    const now = current.get(id)
    if (was?.quantity === now?.quantity) return []

    // El nombre sale del que exista: un depósito puede haberse sumado o quedado
    // sin fila entre las dos lecturas.
    const name = now?.warehouse.name ?? was?.warehouse.name ?? String(id)
    return [`${label(name)}: ${was?.quantity ?? 0} → ${now?.quantity ?? 0}`]
  })
}
