import type { OrderFilters, OrderStatus } from './types'
import type { DraftQuotePayload } from './utils/shipping'

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
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
  // Cuelga de `orders` y no de un dominio `shipments` propio: se pide por orden,
  // y así invalidar `orderKeys.all` también refresca el envío que muestra.
  shipment: (orderId: number) => [...orderKeys.all, 'shipment', orderId] as const,
}

/**
 * La cotización del alta manual (TESIS-59).
 *
 * Tiene su propia raíz y no cuelga de `orders` a propósito: confirmar la orden
 * invalida `orderKeys.all`, y si la cotización colgara de ahí se volvería a
 * pedir a todos los couriers apenas se crea la orden —una llamada de más por
 * operador y, si el despacho falló, una lista que cambia mientras el operador
 * decide si reintentar—.
 *
 * El borrador entero entra en la clave: volver al paso 2 y cambiar el depósito
 * o una cantidad es otra cotización, no la misma con datos viejos.
 */
export const quoteKeys = {
  all: ['quotes'] as const,
  draft: (payload: DraftQuotePayload) => [...quoteKeys.all, 'draft', payload] as const,
}

/**
 * El catálogo que consulta el buscador del alta manual.
 *
 * Cuelga de la raíz del recurso que lee —`['inventory', 'products']`, la misma
 * que usa `features/inventory/queryKeys.ts`— y no de `orders`: así un alta o
 * una edición de producto, que invalidan ese dominio, refrescan también este
 * buscador. Es la misma regla que los contadores (architecture.md §4.2). Se
 * escribe como literal porque una feature no puede importar la factory de
 * otra.
 */
export const catalogKeys = {
  products: () => ['inventory', 'products', 'catalog'] as const,
  // Las dos siguientes cuelgan de las claves de `inventoryKeys.product(id)` y
  // `inventoryKeys.warehouses()`, así un ajuste de stock o un depósito nuevo
  // también refrescan el paso 2. Llevan un segmento más y no son la misma
  // clave: el inventario guarda ahí otra forma de dato (el `Product` entero, el
  // depósito sin código postal), y dos queries con la misma clave se pisarían
  // la caché.
  productStocks: (productId: number) =>
    ['inventory', 'products', 'detail', productId, 'stocks'] as const,
  warehouses: () => ['inventory', 'warehouses', 'origin'] as const,
}

/** El vocabulario de provincias. No cambia durante la sesión. */
export const provinceKeys = {
  all: () => [...orderKeys.all, 'provinces'] as const,
}
