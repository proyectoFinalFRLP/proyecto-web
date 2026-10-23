import { client } from './client'

// Frontera con `GET /api/v1/orders/provinces` (TESIS-128). Vive en `shared/`
// por la Regla de Dos: la piden el domicilio de la orden (alta y edición) y el
// formulario del depósito, que valida contra la misma lista (`Order::PROVINCES`).
// Hasta TESIS-188 cada feature tenía su copia del fetch y su propia clave, así
// que la misma lista se pedía y se guardaba dos veces.

/**
 * Una sola clave para las dos features: la lista se pide una vez por sesión y
 * la comparten. Tiene raíz propia y no cuelga de `orders`: invalidar las órdenes
 * (cada alta, cada edición) no tiene por qué volver a pedir un vocabulario fijo.
 */
export const provinceKeys = {
  all: ['provinces'] as const,
}

/**
 * Las provincias que acepta el backend. Se leen de la API y no se escriben acá
 * porque tienen que coincidir carácter por carácter, tildes incluidas: una
 * provincia mal escrita es un 422 al guardar.
 */
export async function fetchProvinces(): Promise<string[]> {
  const { data } = await client.get<{ data: string[] }>('/orders/provinces')

  return data.data
}
