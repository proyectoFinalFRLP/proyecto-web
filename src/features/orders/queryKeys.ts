import type { OrderFilters, OrderStatus } from './types'

// Factory de query keys de la feature — nunca literales sueltos en los hooks,
// así las invalidaciones no se desincronizan cuando aparezcan las mutaciones
// del alta manual y la edición.

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  counts: () => [...orderKeys.all, 'count'] as const,
  // `status ?? 'all'`: sin esto, la clave de "todas" y la de un estado
  // indefinido serían la misma sólo por casualidad de serialización. El término
  // de búsqueda entra en la clave porque los contadores también lo respetan.
  count: (status: OrderStatus | undefined, search: string) =>
    [...orderKeys.counts(), status ?? 'all', search] as const,
}
