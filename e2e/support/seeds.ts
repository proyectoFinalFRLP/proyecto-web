// Datos de los seeds de desarrollo de la API (`bin/rails db:seed`) que usan los
// tests. Si cambian los seeds, cambian acá.

/** La empresa con más datos: catálogo, depósitos, órdenes y envíos. */
export const NORTE_ADMIN = { email: 'admin@norte.com', password: 'password123' }

/** La otra empresa activa: sirve para comprobar el aislamiento entre tenants. */
export const SUR_ADMIN = { email: 'admin@sur.com', password: 'password123' }

/** Producto de Norte con stock en los dos depósitos. */
export const NORTE_PRODUCT = { sku: 'NOR-003', name: 'Mouse Inalámbrico Logitech' }

/** Depósito de Norte que tiene stock de `NORTE_PRODUCT`. */
export const NORTE_WAREHOUSE = 'Depósito Central'

/** Sesión que guarda `auth.setup.ts` y reusa el resto de los tests. */
export const ADMIN_STORAGE_STATE = 'e2e/.auth/admin.json'

/** Sufijo único por corrida: los tests crean datos en una base que no se limpia. */
export function uniqueSuffix(): string {
  return Date.now().toString(36).toUpperCase()
}
