import { z } from 'zod'

import { inventoryCopy } from '../../content'

const { validation } = inventoryCopy

// Los inputs numéricos se registran con `valueAsNumber`, así que un campo vacío
// llega como NaN. `z.number()` lo rechaza por tipo: el mensaje de ese caso es el
// de "ingresá un número", no el de "negativo".
const nonNegativeNumber = z.number({ error: validation.numberRequired }).min(0, validation.negative)

const stockFieldSchema = z.object({
  warehouseId: z.number().int(),
  warehouseName: z.string(),
  warehouseAddress: z.string(),
  quantity: nonNegativeNumber.int(validation.quantityInteger),
})

/**
 * Fuente única de verdad del formulario: de acá sale la validación y también el
 * tipo (`EditProductFormData`). Nunca declarar la interfaz por separado (ADR-006).
 *
 * El SKU queda fuera del schema a propósito: es de solo lectura por diseño, se
 * pinta pero no se edita ni se envía. La categoría sí se edita: `''` es «sin
 * categoría» (ver `CreateProductModal.schema.ts`).
 */
export const editProductSchema = z.object({
  name: z.string().trim().min(1, validation.nameRequired),
  category: z.string(),
  weight: nonNegativeNumber,
  length: nonNegativeNumber,
  width: nonNegativeNumber,
  height: nonNegativeNumber,
  stocks: z.array(stockFieldSchema),
})

export type EditProductFormData = z.infer<typeof editProductSchema>
export type StockFieldData = z.infer<typeof stockFieldSchema>
