import { z } from 'zod'

import { warehousesCopy } from '../../content'

const { validation } = warehousesCopy.form

// Código postal argentino: el de 4 dígitos (1900) o el CPA de 8 caracteres
// (B1900ABC). La API sólo exige que esté, pero de este número sale la
// cotización de cada envío: uno mal escrito falla recién al cotizar, lejos de
// donde se cargó.
const ZIP_CODE = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/

// El techo de `Warehouse::MAX_CAPACITY`: la columna es `integer` de 4 bytes y
// un número más grande reventaba al guardar. Se valida acá para decirlo en el
// campo y no con un 422 genérico.
const MAX_CAPACITY = 2_147_483_647

// Texto y no `valueAsNumber`, como las medidas del producto: un input de número
// vacío llega como NaN y no se distingue de «no la declaré». Sólo dígitos: una
// capacidad con decimales o con signo no es una cantidad de unidades.
const capacitySchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d+$/.test(value), validation.capacityInteger)
  .refine((value) => value === '' || Number(value) > 0, validation.capacityPositive)
  .refine((value) => value === '' || Number(value) <= MAX_CAPACITY, validation.capacityTooLarge)

/** Fuente única del formulario y de su tipo (ADR-006). */
export const warehouseFormSchema = z.object({
  name: z.string().trim().min(1, validation.nameRequired),
  address: z.string().trim().min(1, validation.addressRequired),
  zipCode: z
    .string()
    .trim()
    .min(1, validation.zipCodeRequired)
    .regex(ZIP_CODE, validation.zipCodeFormat),
  // Opcionales (TESIS-185): `''` es «sin cargar» y viaja como `null`. La
  // provincia no necesita validarse acá: el select sólo ofrece las de la API.
  city: z.string().trim(),
  province: z.string(),
  // Opcional (TESIS-162): sin ella el depósito no tiene techo declarado y el
  // panel lo compara con los demás en vez de medir su ocupación. Mayor que cero,
  // como en el modelo.
  capacity: capacitySchema,
})

export type WarehouseFormData = z.infer<typeof warehouseFormSchema>
