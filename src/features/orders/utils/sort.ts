/**
 * Las claves por las que la API ordena el listado de órdenes (TESIS-184,
 * `OrdersController::SORTS`). Las columnas de `OrdersTable` las declaran en su
 * `sortKey`; ésta es la lista con la que se valida lo que llega por la URL.
 */
export const ORDER_SORT_KEYS = ['created_at', 'destination', 'status', 'courier', 'total']
