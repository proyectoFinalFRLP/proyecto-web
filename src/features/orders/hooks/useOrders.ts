import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'

import { fetchOrderCount, fetchOrderPage } from '../api'
import { orderKeys } from '../queryKeys'
import type { OrderFilters, OrderPage, OrderStatus } from '../types'

/**
 * Las pestañas del listado, en el orden del diseño, con el estado que filtra
 * cada una. `all` no filtra.
 *
 * Es una sola lista y no dos arrays paralelos a propósito: los contadores se
 * piden en este mismo orden y se leen por índice, así que dos listas que haya
 * que mantener alineadas a mano son una pestaña mostrando el número de otra.
 */
export const ORDER_TABS = [
  { id: 'all', status: undefined },
  { id: 'pending', status: 'pending' },
  { id: 'paid', status: 'paid' },
  { id: 'cancelled', status: 'cancelled' },
] as const satisfies readonly { id: string; status: OrderStatus | undefined }[]

export type OrderTabId = (typeof ORDER_TABS)[number]['id']

/**
 * Una página del listado.
 *
 * `keepPreviousData` es lo que hace que pasar de página no vacíe la tabla: sin
 * esto, cada click deja el cuerpo en blanco hasta que responde la API y la
 * pantalla salta de alto. Con esto se muestran las filas viejas atenuadas
 * mientras la página nueva viaja.
 */
export function useOrderPage(filters: OrderFilters) {
  return useQuery<OrderPage>({
    queryKey: orderKeys.list(filters),
    queryFn: () => fetchOrderPage(filters),
    placeholderData: keepPreviousData,
  })
}

/**
 * Los cuatro contadores de las pestañas, en paralelo.
 *
 * Son cuatro consultas de una fila cada una en lugar de cuatro páginas
 * completas: lo único que se lee es el total del scope filtrado.
 *
 * Respetan la búsqueda. Si no lo hicieran, buscar algo que no existe dejaría la
 * tabla vacía con una pestaña que sigue diciendo "Todas (4.829)", y el número
 * pasaría a contradecir lo que se ve. No dependen, en cambio, de la página ni
 * de la pestaña activa: navegar no los vuelve a pedir.
 */
export function useOrderCounts(search: string) {
  return useQueries({
    queries: ORDER_TABS.map(({ status }) => ({
      queryKey: orderKeys.count(status, search),
      queryFn: () => fetchOrderCount(status, search),
    })),
    // Un contador que falla no puede voltear la pantalla: la tabla se ve igual
    // y la pestaña queda sin número.
    combine: (results) => results.map((result) => result.data),
  })
}
