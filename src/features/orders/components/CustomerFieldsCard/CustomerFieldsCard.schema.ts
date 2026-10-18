import { z } from 'zod'

import { ordersCopy } from '../../content'
import { optionalEmail, optionalPhone } from '../../utils/contact'

const { validation } = ordersCopy.draft.customer

/**
 * Fuente única de verdad de los datos del cliente del paso 1: de acá salen la
 * validación y el tipo del formulario.
 *
 * Los tres son obligatorios porque `orders.customer_name` es `NOT NULL` y la
 * card pide el documento antes de avanzar. Se recortan los espacios para que
 * un campo con sólo blancos no cuente como cargado.
 */
export const customerSchema = z.object({
  firstName: z.string().trim().min(1, validation.firstNameRequired),
  lastName: z.string().trim().min(1, validation.lastNameRequired),
  document: z.string().trim().min(1, validation.documentRequired),
  // El contacto es opcional (TESIS-179): la orden se crea igual sin él.
  email: optionalEmail(validation.emailInvalid),
  phone: optionalPhone,
})

export type CustomerFormData = z.infer<typeof customerSchema>
