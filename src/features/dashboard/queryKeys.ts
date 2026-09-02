// Factory de query keys de la feature. Centraliza las keys de React Query en un
// solo lugar (nunca literales sueltos en los hooks) para que las invalidaciones
// sean consistentes: `queryClient.invalidateQueries({ queryKey: orderKeys.all })`
// alcanza a listas. Estos keys se mudarán a las features `orders` y `shipments`
// cuando existan como módulos completos. Patrón por feature (ver architecture.md §4.3).

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
}

export const shipmentKeys = {
  all: ['shipments'] as const,
  lists: () => [...shipmentKeys.all, 'list'] as const,
}

export const integrationKeys = {
  all: ['integrations'] as const,
  lists: () => [...integrationKeys.all, 'list'] as const,
}
