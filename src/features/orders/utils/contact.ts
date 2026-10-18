import { z } from 'zod'

/**
 * El email del cliente, opcional (TESIS-179): en blanco vale, y si se escribe
 * tiene que tener forma de email. Lo usan el alta y la edición.
 */
export function optionalEmail(message: string) {
  return z
    .string()
    .trim()
    .refine((value) => value === '' || z.email().safeParse(value).success, message)
}

/** El teléfono, opcional y libre: cada cliente lo escribe a su manera. */
export const optionalPhone = z.string().trim()
