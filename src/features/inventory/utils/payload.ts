import type { EditProductFormData } from '../components/EditProductModal/EditProductModal.schema'
import type { Product, UpdateProductPayload } from '../types'

import { formatDimensions, isParseableDimensions } from './dimensions'

/**
 * Traduce el formulario al cuerpo de `PUT /api/v1/products/:id`.
 *
 * Concentra las tres reglas que no son obvias mirando el Figma:
 *
 * 1. **Depósitos quitados viajan en 0.** `Products::UpdateProduct` hace upsert
 *    por `warehouse_id` y nunca destruye: omitir un depósito del array no lo
 *    desasigna, deja la fila con su cantidad anterior. Mandarlo explícitamente
 *    en 0 es lo más cerca del borrado que permite la API de hoy.
 * 2. **`description` se reenvía tal cual.** El modal no la edita; si no viajara,
 *    el update la dejaría intacta, pero mandarla explícita evita depender de ese
 *    detalle del backend.
 * 3. **Las medidas fuera de formato se conservan.** Ver `dimensions.ts`.
 */
export function buildUpdatePayload(
  product: Product,
  data: EditProductFormData,
): UpdateProductPayload {
  const nextDimensions = formatDimensions({
    length: data.length,
    width: data.width,
    height: data.height,
  })

  const dimensions =
    nextDimensions === null && !isParseableDimensions(product.dimensions)
      ? product.dimensions
      : nextDimensions

  const keptIds = new Set(data.stocks.map((stock) => stock.warehouseId))

  const removed = product.stocks
    .filter((stock) => !keptIds.has(stock.warehouseId))
    .map((stock) => ({ warehouse_id: stock.warehouseId, quantity: 0 }))

  return {
    product: {
      name: data.name,
      description: product.description,
      weight: data.weight,
      dimensions,
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
