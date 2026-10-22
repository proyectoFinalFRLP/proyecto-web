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
 * Los textos opcionales (descripción, empaque, norma técnica) en blanco viajan
 * en `null` y no como `""`: un espacio suelto no es un dato, y el detalle
 * muestra «—» para el `null`, no para el texto vacío.
 */
function textOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Traduce el formulario de alta al cuerpo de `POST /api/v1/products`.
 *
 * La clave anidada es `stocks` y no `stocks_attributes` — ver `types.ts`.
 */
export function buildCreatePayload(data: CreateProductFormData): CreateProductPayload {
  return {
    product: {
      sku: data.sku,
      name: data.name,
      description: textOrNull(data.description),
      category: categoryOf(data.category),
      packaging: textOrNull(data.packaging),
      technical_standard: textOrNull(data.technicalStandard),
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
 * Concentra la regla que no es obvia mirando el Figma: **los depósitos
 * quitados viajan en 0.** `Products::UpdateProduct` hace upsert por
 * `warehouse_id` y nunca destruye: omitir un depósito del array no lo
 * desasigna, deja la fila con su cantidad anterior. Mandarlo explícitamente en
 * 0 es lo más cerca del borrado que permite la API de hoy.
 *
 * La descripción ya no se reenvía tal cual vino: el modal la edita, junto con
 * el empaque y la norma técnica. Con alcance `stock` el formulario no los
 * muestra, pero sí los tiene —se cargan del producto al abrir—, así que viajan
 * sin cambios.
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
      description: textOrNull(data.description),
      category: categoryOf(data.category),
      packaging: textOrNull(data.packaging),
      technical_standard: textOrNull(data.technicalStandard),
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
