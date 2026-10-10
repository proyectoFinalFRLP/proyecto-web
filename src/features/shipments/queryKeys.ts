import type { ShipmentFilters } from './types'

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
  // Las cinco pestañas en una respuesta (TESIS-165). El término entra en la
  // clave igual que en la del listado: si no, las pestañas seguirían contando
  // la empresa entera mientras la tabla muestra lo buscado.
  tabCounts: (search: string) => [...shipmentKeys.counts(), 'tabs', search] as const,
}
