import { z } from 'zod'

import { ordersCopy } from '../../content'

const { validation } = ordersCopy.shipping.destination

/**
 * Código postal argentino: los 4 dígitos de siempre (1193) o el CPA completo,
 * letra de provincia + 4 dígitos + 3 letras de manzana (C1193ABC). Los couriers
 * aceptan los dos; lo que no sirve es cualquier otra cosa, porque la cotización
 * del paso 3 sale de este dato.
 */
const ZIP_CODE = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/

/**
 * Fuente única de verdad del domicilio de entrega del paso 2: de acá salen la
 * validación y el tipo del formulario.
 *
 * Los cuatro son obligatorios. El código postal lo pide la card (es el dato de
 * la cotización); dirección, ciudad y provincia, porque sin ellos la etiqueta
 * del courier no tiene a dónde llevar el paquete. El backend los acepta vacíos
 * sólo por las órdenes viejas y las de webhook (TESIS-128). La provincia se
 * elige de la lista que devuelve la API, así que acá alcanza con que no falte.
 */
export const destinationSchema = z.object({
  address: z.string().trim().min(1, validation.addressRequired),
  city: z.string().trim().min(1, validation.cityRequired),
  province: z.string().min(1, validation.provinceRequired),
  zipCode: z
    .string()
    .trim()
    .min(1, validation.zipCodeRequired)
    .regex(ZIP_CODE, validation.zipCodeFormat),
})

export type DestinationFormData = z.infer<typeof destinationSchema>
