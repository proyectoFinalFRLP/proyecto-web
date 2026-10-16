import type { DataTableSort } from 'shared/components'

// Factory de query keys de la feature — nunca literales sueltos en los hooks.

export const warehouseKeys = {
  all: ['warehouses'] as const,
  /** El orden va en la clave (TESIS-184): cada orden es otra lista en caché. */
  list: (sort: DataTableSort | null = null) => [...warehouseKeys.all, 'list', sort] as const,
}
