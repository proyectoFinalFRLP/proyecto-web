/**
 * Un texto en blanco no es un dato: viaja y se muestra como `null`, nunca como
 * `""`. Lo demás se recorta.
 *
 * Lo usan las dos fronteras con la API, que tenían cada una su copia
 * (TESIS-89, TESIS-188):
 *
 * · Al mandar: un campo opcional vacío va en `null` porque algunos se validan
 *   contra una lista —la provincia contra `Order::PROVINCES`— y el texto vacío
 *   no está en ella (el 422 del retiro en el local, TESIS-178).
 * · Al leer: un texto en blanco que vino de la API no se pinta como un rótulo
 *   vacío; la pantalla esconde la fila.
 *
 * Acepta `null` y `undefined` porque del lado de la lectura el campo puede no
 * venir (una API anterior que todavía no lo manda).
 */
export function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' ? null : trimmed
}
