import type { Product } from '../types'

/** Un cambio detectado, con clave estable para renderizar la lista. */
export interface ConflictChange {
  /**
   * Clave para React. No se usa el texto: dos depósitos pueden llamarse igual,
   * y ahí dos filas distintas producirían la misma cadena.
   */
  id: string
  text: string
}

export interface ConflictLabels {
  name: string
  description: string
  weight: string
  dimensions: string
  stockIn: (warehouse: string) => string
}

/** Lado ausente de una comparación: el campo no existe o el depósito no estaba. */
const ABSENT = '—'

/**
 * Qué cambió en el producto entre que el modal lo abrió y el servidor lo
 * rechazó por versión vieja.
 *
 * Existe para que el conflicto no sea sólo "alguien lo tocó": el usuario tiene
 * que poder decidir si pisa o no, y para eso necesita saber qué se movió.
 *
 * Compara **los mismos campos que el backend digiere para el ETag**
 * (`Catalog::ProductVersion#edited_fields` más el stock por depósito), y no
 * los que el modal edita. Son conjuntos distintos: `description` entra en la
 * versión pero el modal no la muestra, así que si no se comparara, un conflicto
 * causado sólo por ese campo aparecería como "no pudimos determinar qué cambió".
 */
export function describeConflict(
  before: Product,
  after: Product,
  labels: ConflictLabels,
): ConflictChange[] {
  const changes: ConflictChange[] = []

  if (before.name !== after.name) {
    changes.push({ id: 'name', text: `${labels.name}: ${before.name} → ${after.name}` })
  }

  if (before.description !== after.description) {
    changes.push({
      id: 'description',
      text: `${labels.description}: ${before.description ?? ABSENT} → ${after.description ?? ABSENT}`,
    })
  }

  if (before.weight !== after.weight) {
    changes.push({ id: 'weight', text: `${labels.weight}: ${before.weight} → ${after.weight}` })
  }

  if (before.dimensions !== after.dimensions) {
    changes.push({
      id: 'dimensions',
      text: `${labels.dimensions}: ${before.dimensions ?? ABSENT} → ${after.dimensions ?? ABSENT}`,
    })
  }

  return changes.concat(stockChanges(before, after, labels.stockIn))
}

function stockChanges(
  before: Product,
  after: Product,
  label: (warehouse: string) => string,
): ConflictChange[] {
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
    // Un depósito que aparece o desaparece se muestra con `—` y no con 0. Antes
    // se leía "0 → 0" —porque el lado ausente caía en 0— y eso no dice nada; el
    // depósito con cantidad 0 es además un caso legítimo y distinto.
    const from = was === undefined ? ABSENT : String(was.quantity)
    const to = now === undefined ? ABSENT : String(now.quantity)

    return [{ id: `stock:${id}`, text: `${label(name)}: ${from} → ${to}` }]
  })
}
