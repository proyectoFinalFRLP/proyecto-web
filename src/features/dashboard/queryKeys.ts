// Factory de query keys de la feature. Centraliza las keys de React Query en un
// solo lugar (nunca literales sueltos en los hooks) para que las invalidaciones
// sean consistentes. Patrón por feature (ver architecture.md §4.3).

export const integrationKeys = {
  all: ['integrations'] as const,
  lists: () => [...integrationKeys.all, 'list'] as const,
}

// Los KPIs cuelgan de la raíz del recurso que cuentan —la misma `['orders']`
// que usa `features/orders`— y no de una raíz propia del panel: así una
// mutación de órdenes que invalide su dominio entero refresca también el
// contador de acá, sin que el panel tenga que enterarse. La rama `kpi` es
// propia para no pisar por casualidad las keys de conteo del listado.
export const orderKeys = {
  all: ['orders'] as const,
  kpi: (status: string) => [...orderKeys.all, 'kpi', status] as const,
}

export const shipmentKeys = {
  all: ['shipments'] as const,
  kpi: (status: string) => [...shipmentKeys.all, 'kpi', status] as const,
}

// Misma regla que los KPIs de órdenes y envíos: la key cuelga de la raíz del
// recurso que lee —`['inventory']`, la que usa `features/inventory`— para que
// un alta o una edición de producto refresque también el contador del panel.
// Se escribe como literal porque una feature no importa la factory de otra.
export const inventoryKpiKeys = {
  all: ['inventory'] as const,
  alerts: (status: string) => ['inventory', 'kpi', status] as const,
  warehouseLoads: () => ['inventory', 'warehouses', 'loads'] as const,
}
