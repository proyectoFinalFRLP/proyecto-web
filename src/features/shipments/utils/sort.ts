/**
 * Las claves por las que la API ordena el listado de envíos (TESIS-184,
 * `ShipmentsController::SORTS`). Las columnas de `ShipmentsTable` las declaran
 * en su `sortKey`; ésta es la lista con la que se valida lo que llega por la URL.
 */
export const SHIPMENT_SORT_KEYS = [
  'id',
  'courier',
  'tracking_number',
  'shipping_cost',
  'status',
  'created_at',
]
