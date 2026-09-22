import { z } from 'zod'

import { ordersCopy } from '../../content'

const { validation } = ordersCopy.edit.context

/**
 * Los datos de la orden que se editan en S09 además del destino: quién compra
 * y en qué estado está.
 *
 * El estado sólo va y vuelve entre `pending` y `paid`: es lo que acepta la
 * modificación (TESIS-126). Cancelar devuelve el stock de la orden entera y
 * decide qué pasa con su envío, así que no es una edición y no se ofrece.
 *
 * El cliente viaja como un solo campo porque así lo guarda la orden
 * (`customer_name`): el alta lo arma uniendo nombre y apellido, pero una vez
 * guardado no hay cómo volver a separarlos.
 */
export const orderContextSchema = z.object({
  customerName: z.string().trim().min(1, validation.customerNameRequired),
  customerDocument: z.string().trim().min(1, validation.customerDocumentRequired),
  status: z.enum(['pending', 'paid']),
})

export type OrderContextFormData = z.infer<typeof orderContextSchema>
