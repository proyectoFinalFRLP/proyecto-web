import { z } from 'zod'

import { inventoryCopy } from '../../content'

const { validation } = inventoryCopy.detail.transferModal

/**
 * Fuente única del formulario (ADR-006). El tope de cantidad depende del
 * depósito elegido, así que el schema se arma con las unidades de cada origen.
 *
 * Los selects arrancan vacíos: `0` no es un id válido y el mensaje es el de
 * "elegí", no uno de tipo.
 */
export function transferStockSchema(unitsByWarehouse: ReadonlyMap<number, number>) {
  return z
    .object({
      originId: z.number().int().positive(validation.originRequired),
      destinationId: z.number().int().positive(validation.destinationRequired),
      quantity: z
        .number({ error: validation.quantityRequired })
        .int(validation.quantityInteger)
        .positive(validation.quantityPositive),
    })
    .superRefine((data, context) => {
      if (data.originId > 0 && data.originId === data.destinationId) {
        context.addIssue({
          code: 'custom',
          path: ['destinationId'],
          message: validation.sameWarehouse,
        })
      }

      const available = unitsByWarehouse.get(data.originId)
      if (available !== undefined && data.quantity > available) {
        context.addIssue({
          code: 'custom',
          path: ['quantity'],
          message: validation.quantityTooHigh(available),
        })
      }
    })
}

export type TransferStockFormData = z.infer<ReturnType<typeof transferStockSchema>>
