import { z } from 'zod'

import { inventoryCopy } from '../../content'

const { validation } = inventoryCopy

// Los inputs numéricos se registran con `valueAsNumber`, así que un campo vacío
// llega como NaN. `z.number()` lo rechaza por tipo: ese caso muestra "ingresá un
// número" y no el mensaje de negativo.
const nonNegativeNumber = z.number({ error: validation.numberRequired }).min(0, validation.negative)

// `warehouseId` arranca en 0 = "sin elegir". `positive()` es lo que convierte
// una fila recién agregada en inválida hasta que el usuario elige el depósito.
const stockRowSchema = z.object({
  warehouseId: z
    .number({ error: validation.warehouseRequired })
    .positive(validation.warehouseRequired),
  quantity: nonNegativeNumber.int(validation.quantityInteger),
})

/**
 * Fuente única de verdad del alta: de acá salen la validación y el tipo.
 *
 * La categoría queda fuera a propósito — `products` no tiene esa columna, así
 * que el campo se pinta pero no se edita ni se envía.
 *
 * `description` tampoco está: el frame del alta no tiene ese campo, así que no
 * hay nada que validar. Viaja igual en el payload, en `null` explícito y no por
 * omisión, para no depender de qué hace el backend con una clave ausente (ver
 * `utils/payload.ts`). Si el diseño la agrega, entra acá primero.
 */
export const createProductSchema = z.object({
  name: z.string().trim().min(1, validation.nameRequired),
  sku: z.string().trim().min(1, validation.skuRequired),
  weight: nonNegativeNumber,
  length: nonNegativeNumber,
  width: nonNegativeNumber,
  height: nonNegativeNumber,
  stocks: z
    .array(stockRowSchema)
    // La card pide validar duplicados antes de mandar. Además de ser una mejor
    // experiencia, evita un 500: `stocks` tiene un índice único por
    // (product_id, warehouse_id), así que dos filas del mismo depósito
    // reventarían la transacción del lado del server.
    .refine(
      (rows) => new Set(rows.map((row) => row.warehouseId)).size === rows.length,
      validation.duplicateWarehouse,
    ),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>
