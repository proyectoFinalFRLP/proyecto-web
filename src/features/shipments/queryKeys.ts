import type { ShipmentFilters, ShipmentStatus } from './types'

// Factory de query keys de la feature (architecture.md §4.3).
//
// La raíz es `['shipments']`, la misma que usa el panel para su KPI y su
// tarjeta de últimos envíos: despachar uno invalida ese dominio y refresca las
// tres cosas sin que ninguna tenga que enterarse de las otras.
export const shipmentKeys = {
  all: ['shipments'] as const,
  lists: () => [...shipmentKeys.all, 'list'] as const,
  list: (filters: ShipmentFilters) => [...shipmentKeys.lists(), filters] as const,
  counts: () => [...shipmentKeys.all, 'count'] as const,
  // `status ?? 'all'`: sin esto, la clave de «todos» y la de un estado
  // indefinido serían la misma sólo por casualidad de serialización.
  // El término entra en la clave del contador igual que en la del listado: si
  // no, las pestañas seguirían contando la empresa entera mientras la tabla
  // muestra lo buscado.
  count: (status: ShipmentStatus | undefined, search: string) =>
    [...shipmentKeys.counts(), status ?? 'all', search] as const,
}
