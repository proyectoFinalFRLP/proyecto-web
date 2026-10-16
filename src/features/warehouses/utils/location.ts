import type { Warehouse } from '../types'

/**
 * Dónde está el depósito, como se lee en el listado: «Av. 7 N° 1234, La Plata,
 * Buenos Aires». La localidad y la provincia son opcionales (TESIS-185): la
 * que falta se omite en vez de dejar una coma colgando.
 */
export function formatLocation({
  address,
  city,
  province,
}: Pick<Warehouse, 'address' | 'city' | 'province'>): string {
  return [address, city, province].filter((part) => part !== null && part !== '').join(', ')
}
