import type { z } from 'zod'

/**
 * Los campos de un formulario que todavía no pasan su schema, en el orden en
 * que se muestran en pantalla (`order`). Es lo que los pasos 1 y 2 del alta
 * listan debajo de «Siguiente» cuando el botón está apagado (TESIS-173).
 *
 * Se valida contra el schema y no contra los `errors` de React Hook Form:
 * ésos aparecen recién cuando el campo se toca, y lo que hay que decir es qué
 * falta desde el principio, también de los campos que nadie tocó todavía.
 */
export function invalidFields<Field extends string>(
  schema: z.ZodType,
  values: unknown,
  order: readonly Field[],
): Field[] {
  const result = schema.safeParse(values)
  if (result.success) return []

  const failing = new Set(result.error.issues.map((issue) => issue.path[0]))
  return order.filter((field) => failing.has(field))
}
