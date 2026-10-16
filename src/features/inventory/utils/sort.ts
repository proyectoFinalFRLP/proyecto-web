/**
 * Las claves por las que la API ordena el catálogo (TESIS-184,
 * `ProductsController::SORTS`). Las columnas de `InventoryTable` las declaran
 * en su `sortKey`; ésta es la lista con la que se valida lo que llega por la URL.
 */
export const PRODUCT_SORT_KEYS = ['sku', 'name', 'category', 'total_stock']
