import type { IntegrationFieldSpec, IntegrationService } from 'shared/api'
import { z } from 'zod'

import type { ConnectionPayload } from '../api'
import { integrationsCopy } from '../content'

// El formulario de conexión no es fijo: sale de lo que declara la plantilla
// (`credential_fields`, `setting_fields`). Estas funciones son el puente entre
// esa declaración y React Hook Form, y viven aparte para probarlas sin montar el
// modal.

const { fieldErrors } = integrationsCopy

export interface ConnectionFormValues {
  credentials: Record<string, string>
  settings: Record<string, string>
}

/**
 * El formato viene escrito para Ruby (`\A…\z`). JavaScript no conoce esos
 * anclajes: se traducen a `^…$`. Un patrón que igual no compila no bloquea el
 * formulario: la API vuelve a validarlo y contesta con el campo que falló.
 */
export function toJsRegExp(format: string | null): RegExp | null {
  if (!format) return null

  try {
    return new RegExp(format.replace(/\\A/g, '^').replace(/\\[zZ]/g, '$'))
  } catch {
    return null
  }
}

function fieldSchema(field: IntegrationFieldSpec, canBeBlank: boolean) {
  const pattern = toJsRegExp(field.format)

  return z
    .string()
    .trim()
    .superRefine((value, context) => {
      if (value === '') {
        if (field.required && !canBeBlank) {
          context.addIssue({ code: 'custom', message: fieldErrors.required })
        }
        return
      }
      if (pattern && !pattern.test(value)) {
        context.addIssue({ code: 'custom', message: fieldErrors.invalid_format })
      }
    })
}

function shape(fields: IntegrationFieldSpec[], canBeBlank: (key: string) => boolean) {
  return Object.fromEntries(
    fields.map((field) => [field.key, fieldSchema(field, canBeBlank(field.key))]),
  )
}

/**
 * Un secreto ya cargado puede quedar vacío: el back nunca lo devuelve, así que
 * el formulario no lo puede precargar, y «vacío» quiere decir «no lo cambies».
 */
export function buildConnectionSchema(service: IntegrationService) {
  return z.object({
    credentials: z.object(
      shape(service.credentialFields, (key) => service.credentialsSet.includes(key)),
    ),
    settings: z.object(shape(service.settingFields, () => false)),
  })
}

export function defaultConnectionValues(service: IntegrationService): ConnectionFormValues {
  return {
    credentials: Object.fromEntries(service.credentialFields.map((field) => [field.key, ''])),
    settings: Object.fromEntries(
      service.settingFields.map((field) => [field.key, service.settings[field.key] ?? '']),
    ),
  }
}

/** Los secretos vacíos no viajan (no se cambian); un setting vacío sí (se borra). */
export function toConnectionPayload(values: ConnectionFormValues): ConnectionPayload {
  return {
    credentials: Object.fromEntries(
      Object.entries(values.credentials)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== ''),
    ),
    settings: Object.fromEntries(
      Object.entries(values.settings).map(([key, value]) => [key, value.trim()]),
    ),
  }
}

export interface FormFieldError {
  /** Ruta del campo en el formulario: `credentials.client_id`, `settings.shop_domain`. */
  name: `credentials.${string}` | `settings.${string}`
  message: string
}

function isFieldCode(code: string): code is keyof typeof fieldErrors {
  return code in fieldErrors
}

/**
 * Los `fields` de un 422 (`{ "settings.shop_domain": ["invalid_format"] }`) en
 * errores para cada input. La clave es la misma ruta que usa el formulario.
 */
export function toFormFieldErrors(fields: Record<string, string[]> | undefined): FormFieldError[] {
  return Object.entries(fields ?? {}).flatMap(([path, codes]) => {
    if (!path.startsWith('credentials.') && !path.startsWith('settings.')) return []

    const code = codes[0] ?? ''
    const message = isFieldCode(code) ? fieldErrors[code] : fieldErrors.fallback
    return [{ name: path as FormFieldError['name'], message }]
  })
}
