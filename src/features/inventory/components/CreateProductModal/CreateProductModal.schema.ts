import { z } from 'zod'

import { inventoryCopy } from '../../content'

const { validation } = inventoryCopy

// Los inputs numéricos se registran con `valueAsNumber`, así que un campo vacío
// llega como NaN. `z.number()` lo rechaza por tipo: ese caso muestra "ingresá un
// número" y no el mensaje de negativo.
const nonNegativeNumber = z.number({ error: validation.numberRequired }).min(0, validation.negative)

// Las medidas son opcionales (TESIS-185): el input vacío llega como `null`
// —`measureFromInput`, no `valueAsNumber`— y eso es «sin cargar». Cargada, tiene
// que ser mayor a cero: un eje en 0 no es un paquete que un courier pueda cotizar.
const measureSchema = z
  .number({ error: validation.numberRequired })
  .positive(validation.measurePositive)
  .nullable()

// Texto libre y opcional: la descripción, el empaque y la norma técnica
// (`ProductsController::PRODUCT_FIELDS`). El modelo no los valida ni la columna
// tiene largo máximo, así que acá tampoco: el vacío es «sin cargar» y viaja en
// `null` (ver `utils/payload.ts`).
const optionalTextSchema = z.string()

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
 * La categoría es un string y no un enum: el vocabulario llega de la API
 * (`GET /products/categories`) y el select sólo ofrece esos valores. `''` es
 * «sin categoría», que es válido: la columna es opcional.
 *
 * La descripción, el empaque y la norma técnica son opcionales: `''` es «sin
 * cargar». El detalle del producto ya los mostraba, pero no había dónde
 * cargarlos y salían siempre en «—».
 */
export const createProductSchema = z.object({
  name: z.string().trim().min(1, validation.nameRequired),
  sku: z.string().trim().min(1, validation.skuRequired),
  category: z.string(),
  description: optionalTextSchema,
  packaging: optionalTextSchema,
  technicalStandard: optionalTextSchema,
  weight: nonNegativeNumber,
  length: measureSchema,
  width: measureSchema,
  height: measureSchema,
  // Entero y no negativo, como la columna (TESIS-182). Cero es válido: el
  // producto sólo avisa cuando se agota.
  lowStockThreshold: nonNegativeNumber.int(validation.thresholdInteger),
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
