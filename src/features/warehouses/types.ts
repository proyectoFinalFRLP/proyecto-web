// Tipos de la feature de depósitos, en camelCase. La traducción desde el
// snake_case de Rails vive en `api.ts`.

/** Depósito físico de la empresa. Espejo de `GET /api/v1/warehouses`. */
export interface Warehouse {
  id: number
  name: string
  address: string
  zipCode: string
  /**
   * Localidad y provincia (TESIS-185): el courier (OCA) las pide para el
   * origen del envío. Opcionales: los depósitos anteriores no las tienen.
   */
  city: string | null
  /** Una de `Order::PROVINCES`, la misma lista que el domicilio de una orden. */
  province: string | null
  /** Unidades guardadas sumando todos los productos. Cero es un dato, nunca null. */
  storedUnits: number
  /**
   * Cuántas unidades entran (TESIS-162). `null` = nadie la declaró todavía, que
   * no es cero: el panel no dibuja la barra de ocupación de ese depósito.
   */
  capacity: number | null
}

/** Lo que se edita de un depósito. */
export interface WarehouseInput {
  name: string
  address: string
  zipCode: string
  /** `''` = sin cargar: un input de texto no tiene `null`. */
  city: string
  /** `''` = sin provincia, como el «sin categoría» del producto. */
  province: string
  /** En unidades. `''` = sin declarar; el schema ya garantizó que es un entero. */
  capacity: string
}

/** Cuerpo de `POST`/`PUT /api/v1/warehouses`, en el snake_case que espera Rails. */
export interface WarehousePayload {
  warehouse: {
    name: string
    address: string
    zip_code: string
    city: string | null
    province: string | null
    capacity: number | null
  }
}

/** Por qué la API se niega a borrar un depósito (409). */
export type DeleteBlocker = 'stock' | 'orders' | 'transfers' | 'shipments' | 'unknown'
