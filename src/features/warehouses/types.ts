// Tipos de la feature de depósitos, en camelCase. La traducción desde el
// snake_case de Rails vive en `api.ts`.

/** Depósito físico de la empresa. Espejo de `GET /api/v1/warehouses`. */
export interface Warehouse {
  id: number
  name: string
  address: string
  zipCode: string
  /** Unidades guardadas sumando todos los productos. Cero es un dato, nunca null. */
  storedUnits: number
}

/** Lo que se edita de un depósito. */
export interface WarehouseInput {
  name: string
  address: string
  zipCode: string
}

/** Cuerpo de `POST`/`PUT /api/v1/warehouses`, en el snake_case que espera Rails. */
export interface WarehousePayload {
  warehouse: {
    name: string
    address: string
    zip_code: string
  }
}

/** Por qué la API se niega a borrar un depósito (409). */
export type DeleteBlocker = 'stock' | 'orders' | 'transfers' | 'unknown'
