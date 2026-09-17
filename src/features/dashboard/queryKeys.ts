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
