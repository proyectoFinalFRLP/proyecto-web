// Tipos del dominio de inventario.
//
// Se declaran en camelCase (convención del proyecto). La API Rails responde en
// snake_case (`total_stock`, `warehouse_id`, `updated_at`) y hoy el cliente Axios
// no transforma las claves, así que la traducción vive en la capa que hace el
// fetch — no acá. Este modal es presentacional: recibe ya el dominio armado.

/** Las cuatro categorías del catálogo (`Product::CATEGORIES`). */
export type ProductCategory = 'Electronics' | 'Machinery' | 'Cabling' | 'Power'

/**
 * Disponibilidad del producto. **La decide el backend**, que es donde vive el
 * umbral: si el front la recalculara, pedir «stock bajo» y contar las filas
 * amarillas podrían dar distinto (TESIS-62).
 */
export type StockStatus = 'out_of_stock' | 'low' | 'available'

/** El depósito donde está el grueso de las unidades, para la columna Depósito. */
export interface PrimaryWarehouse {
  id: number
  name: string
  quantity: number
}

/**
 * Fila del listado (`GET /api/v1/products`). El index usa `ProductListSerializer`
 * y **no trae `stocks`**: el desglose por depósito sólo viene en el detalle.
 */
export interface ProductSummary {
  id: number
  sku: string
  name: string
  /** Opcional: los productos anteriores a TESIS-102 no tienen ninguna. */
  category: ProductCategory | null
  totalStock: number
  stockStatus: StockStatus
  /** Unidades que salieron de un depósito y todavía no llegaron a otro. */
  inTransitQuantity: number
  /** `null` cuando el producto no tiene unidades en ningún depósito. */
  primaryWarehouse: PrimaryWarehouse | null
  /** En cuántos depósitos hay unidades. Si es 0, `primaryWarehouse` es null. */
  warehouseCount: number
}

/** Cómo viene paginado el catálogo: el `meta` del backend, en camelCase. */
export interface ProductPage {
  products: ProductSummary[]
  page: number
  perPage: number
  total: number
}

/** Filtros que viajan como query params a `GET /api/v1/products`. */
export interface ProductFilters {
  page: number
  perPage: number
  /** Sin estado, el backend devuelve el catálogo entero. */
  status?: StockStatus
  /** Busca por SKU o por nombre. */
  search?: string
  category?: ProductCategory
}

/** Depósito físico de la empresa. Espejo de `GET /api/v1/warehouses`. */
export interface Warehouse {
  id: number
  name: string
  address: string
}

/** Cantidad de un producto en un depósito concreto (tabla `stocks`). */
export interface ProductStock {
  warehouseId: number
  quantity: number
  warehouse: Warehouse
}

/**
 * Producto del catálogo. Espejo de `GET /api/v1/products/:id`.
 *
 * `dimensions` es un único string en la API; el modal lo abre en largo/ancho/alto
 * para editarlo y lo vuelve a serializar al guardar (ver `utils/dimensions.ts`).
 */
export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  weight: number
  dimensions: string | null
  stocks: ProductStock[]
  updatedAt: string
  /**
   * Versión del agregado que devolvió la API en el header `ETag` (TESIS-101).
   * Vuelve en `If-Match` al guardar; si alguien tocó el producto en el medio, la
   * API rechaza la escritura con 412 en vez de dejar que pise en silencio.
   *
   * `null` cuando la API no la mandó — por ejemplo si CORS no expone el header.
   * En ese caso el guardado sigue funcionando, pero sin la protección.
   */
  version: string | null
}

/**
 * Cuerpo de `POST /api/v1/products`, en el snake_case que espera Rails.
 *
 * ⚠️ La card TESIS-63 especifica la clave anidada como `stocks_attributes`.
 * **La API no la lee**: `Api::V1::ProductsController#stock_params` hace
 * `params[:product][:stocks]`, y `product_params` sólo permite los cinco
 * escalares. Mandando `stocks_attributes` el producto se crearía con 201 y sin
 * una sola unidad de stock, en silencio. La clave correcta es `stocks`.
 */
export interface CreateProductPayload {
  product: {
    sku: string
    name: string
    description: string | null
    weight: number
    dimensions: string | null
    stocks: { warehouse_id: number; quantity: number }[]
  }
}

/**
 * Cuerpo de `PUT /api/v1/products/:id`, en el snake_case que espera Rails.
 *
 * `stocks` es un upsert por `warehouse_id`: la API no borra las asignaciones que
 * no vengan en el array (ver `Products::UpdateProduct`). Por eso quitar un
 * depósito en la UI viaja como `quantity: 0` y no como una omisión.
 */
export interface UpdateProductPayload {
  product: {
    name: string
    description: string | null
    weight: number
    dimensions: string | null
    stocks: { warehouse_id: number; quantity: number }[]
  }
}
