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
  /**
   * Capacidad declarada, en unidades (TESIS-162). `null` cuando nadie la cargó
   * todavía: no es cero, que diría que no entra nada, y por eso la barra de
   * ocupación no se dibuja en ese caso.
   */
  capacity: number | null
}

/** Cantidad de un producto en un depósito concreto (tabla `stocks`). */
export interface ProductStock {
  warehouseId: number
  quantity: number
  /** Vendido y todavía en este depósito (TESIS-162). */
  committed: number
  warehouse: Warehouse
  /**
   * Disponibilidad de este depósito. La calcula el backend con la misma regla
   * que la del producto (`Product.stock_status_for`), aplicada a `quantity`.
   */
  stockStatus: StockStatus
}

/**
 * Unidades en vuelo **hacia** un depósito: salieron de otro y todavía no
 * llegaron. El saliente no aparece porque el backend ya lo descontó del
 * depósito de origen al despachar.
 */
export interface IncomingTransit {
  warehouseId: number
  name: string
  quantity: number
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
  category: ProductCategory | null
  /** Cómo viene embalado. Texto libre: lo describe el rubro, no un vocabulario. */
  packaging: string | null
  /** Norma del producto (IRAM, IEC). Es un código de un organismo externo. */
  technicalStandard: string | null
  weight: number
  dimensions: string | null
  /**
   * Los tres números del stock, que la API calcula desde TESIS-162. Ninguno se
   * deriva acá: `onHand` no es la suma de `stocks[].quantity` —lo vendido sin
   * despachar sigue en el estante pero ya salió de esas filas— y restarlos mal
   * del lado del cliente era justamente el problema.
   *
   * Son números y no `null`: un producto que nadie reservó tiene 0
   * comprometido, que es un dato.
   */
  committed: number
  onHand: number
  availableToPromise: number
  /**
   * El mismo `inTransitQuantity`, con el nombre que usa el detalle. Son el
   * mismo campo de la API (`in_transit_quantity`) y conviene unificarlos.
   */
  inTransit: number
  stocks: ProductStock[]
  /** Unidades en depósito sumando todos los depósitos, calculado por la API. */
  totalStock: number
  /** Disponibilidad del producto: la misma que muestra el catálogo. */
  stockStatus: StockStatus
  /** Unidades en vuelo entre depósitos. **No** están incluidas en `totalStock`. */
  inTransitQuantity: number
  /**
   * El mismo en tránsito, por depósito de destino. Puede nombrar depósitos que
   * todavía no tienen fila en `stocks`: la fila nace cuando la transferencia
   * se recibe. La suma de `quantity` es `inTransitQuantity`.
   */
  inTransitByWarehouse: IncomingTransit[]
  /**
   * Lo vendido sin despachar, por depósito. Puede nombrar depósitos que no
   * están en `stocks`: si la venta se llevó la última unidad, la fila de stock
   * queda en cero o desaparece y las unidades siguen en el estante.
   */
  committedByWarehouse: IncomingTransit[]
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
    /** `null` = sin categoría. El vocabulario es `GET /products/categories`. */
    category: string | null
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
    category: string | null
    weight: number
    dimensions: string | null
    stocks: { warehouse_id: number; quantity: number }[]
  }
}

/**
 * El vínculo de un producto con su publicación en un canal de venta
 * (`product_mappings`, TESIS-139): el id con el que el canal lo vende y con
 * el que el OMS le publica el stock.
 */
export interface ProductMapping {
  id: number
  companyIntegrationId: number
  serviceName: string
  externalProductId: string
}

/**
 * Lo que pide vincular un producto. Sin `externalProductId`, el canal lo busca
 * por el SKU del producto (si sabe hacerlo).
 */
export interface LinkProductPayload {
  companyIntegrationId: number
  externalProductId?: string
}

/** El vínculo creado y lo que conviene revisar (por ejemplo, un SKU distinto). */
export interface LinkProductResult {
  mapping: ProductMapping
  warnings: string[]
}

/**
 * Cuántos productos tiene cada pestaña del catálogo (`GET /products/counts`).
 * Las claves son las de `CATALOG_TABS`: el backend las nombra igual.
 */
export interface CatalogCounts {
  all: number
  available: number
  low: number
  out_of_stock: number
}
