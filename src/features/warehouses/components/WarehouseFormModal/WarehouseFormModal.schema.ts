import { z } from 'zod'

import { warehousesCopy } from '../../content'

const { validation } = warehousesCopy.form

// Código postal argentino: el de 4 dígitos (1900) o el CPA de 8 caracteres
// (B1900ABC). La API sólo exige que esté, pero de este número sale la
// cotización de cada envío: uno mal escrito falla recién al cotizar, lejos de
// donde se cargó.
const ZIP_CODE = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/

/** Fuente única del formulario y de su tipo (ADR-006). */
export const warehouseFormSchema = z.object({
  name: z.string().trim().min(1, validation.nameRequired),
  address: z.string().trim().min(1, validation.addressRequired),
  zipCode: z
    .string()
    .trim()
    .min(1, validation.zipCodeRequired)
    .regex(ZIP_CODE, validation.zipCodeFormat),
})

export type WarehouseFormData = z.infer<typeof warehouseFormSchema>
