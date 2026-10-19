import type { CreateProductFormData } from '../components/CreateProductModal/CreateProductModal.schema'
import type { EditProductFormData } from '../components/EditProductModal/EditProductModal.schema'
import type { CreateProductPayload, Product, UpdateProductPayload } from '../types'

/**
 * El select de categoría usa `''` para «sin categoría» (un `<select>` no tiene
 * `null`); la API la espera en `null`.
 */
function categoryOf(value: string): string | null {
  return value === '' ? null : value
}

/**
 * Traduce el formulario de alta al cuerpo de `POST /api/v1/products`.
 *
 * `description` viaja en `null`: el frame del modal no tiene ese campo, aunque
 * la API lo acepta y el alcance de la card lo menciona. Se manda explícito para
 * dejar dicho que es una ausencia deliberada y no un olvido.
 *
 * La clave anidada es `stocks` y no `stocks_attributes` — ver `types.ts`.
 */
export function buildCreatePayload(data: CreateProductFormData): CreateProductPayload {
  return {
    product: {
      sku: data.sku,
      name: data.name,
      description: null,
      category: categoryOf(data.category),
      weight: data.weight,
      length_cm: data.length,
      width_cm: data.width,
      height_cm: data.height,
      low_stock_threshold: data.lowStockThreshold,
      stocks: data.stocks.map((stock) => ({
        warehouse_id: stock.warehouseId,
        quantity: stock.quantity,
      })),
    },
  }
}

/**
 * Traduce el formulario al cuerpo de `PUT /api/v1/products/:id`.
 *
 * Concentra las dos reglas que no son obvias mirando el Figma:
 *
 * 1. **Depósitos quitados viajan en 0.** `Products::UpdateProduct` hace upsert
 *    por `warehouse_id` y nunca destruye: omitir un depósito del array no lo
 *    desasigna, deja la fila con su cantidad anterior. Mandarlo explícitamente
 *    en 0 es lo más cerca del borrado que permite la API de hoy.
 * 2. **`description` se reenvía tal cual.** El modal no la edita; si no viajara,
 *    el update la dejaría intacta, pero mandarla explícita evita depender de ese
 *    detalle del backend.
 *
 * Las medidas viajan tal cual: tres números en centímetros o `null`
 * (TESIS-185). Ya no hay texto libre que conservar si el formulario no lo
 * entiende, que era la tercera regla cuando eran un solo string.
 */
export function buildUpdatePayload(
  product: Product,
  data: EditProductFormData,
): UpdateProductPayload {
  const keptIds = new Set(data.stocks.map((stock) => stock.warehouseId))

  const removed = product.stocks
    .filter((stock) => !keptIds.has(stock.warehouseId))
    .map((stock) => ({ warehouse_id: stock.warehouseId, quantity: 0 }))

  return {
    product: {
      name: data.name,
      description: product.description,
      category: categoryOf(data.category),
      weight: data.weight,
      length_cm: data.length,
      width_cm: data.width,
      height_cm: data.height,
      low_stock_threshold: data.lowStockThreshold,
      stocks: [
        ...data.stocks.map((stock) => ({
          warehouse_id: stock.warehouseId,
          quantity: stock.quantity,
        })),
        ...removed,
      ],
    },
  }
}
