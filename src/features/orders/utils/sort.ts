import type { DataTableSort } from 'shared/components'

/**
 * Las claves por las que la API ordena el listado de órdenes (TESIS-184,
 * `OrdersController::SORTS`). Las columnas de `OrdersTable` las declaran en su
 * `sortKey`; ésta es la lista con la que se valida lo que llega por la URL.
 */
export const ORDER_SORT_KEYS = ['created_at', 'destination', 'status', 'courier', 'total']

/**
 * El orden que aplica la API cuando no se pide otro (las más nuevas primero). La tabla lo
 * muestra con su flecha para que se vea por qué está ordenada así.
 */
export const ORDER_DEFAULT_SORT: DataTableSort = { key: 'created_at', direction: 'desc' }
