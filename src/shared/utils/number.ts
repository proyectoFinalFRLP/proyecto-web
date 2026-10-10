// El único lugar donde la app decide cómo se escribe un número.
//
// Locale fijo `es-AR`, mismo criterio que `formatDate`: el producto está entero
// en español (ver el vocabulario en `docs/design/README.md`) y todavía no hay
// i18n. El diseño escribe los enteros con punto de miles («4.280») y los
// decimales con coma («1,45 kg»).
//
// Hasta TESIS-166 cada feature tenía su copia: `formatUnits` en inventario y
// depósitos, `formatCount` en órdenes, envíos y eventos fallidos, y tres
// `Intl.NumberFormat` sueltos más. Eran el mismo formateador con distinto
// nombre, y sólo una de las copias se protegía de un valor no finito.

/** La marca de «sin dato» del DS, la misma que usa el resto del producto. */
const UNKNOWN_VALUE = '—'

const INTEGER = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

const DECIMAL = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const MONEY = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const ROUND_MONEY = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

/**
 * Entero con separador de miles: `4280` → `"4.280"`.
 *
 * Un valor que no es un número finito sale como «—» y no como `NaN`.
 * TypeScript dice que no puede pasar, pero el dato viene de la API: si una
 * versión más vieja no manda un campo que esta pantalla ya lee —un front
 * desplegado antes que su backend—, `Intl` imprime `NaN` en la cara del
 * operador. «—» dice lo mismo que diría cualquier otro dato que falta.
 *
 * La guarda estaba en una sola de las copias que este módulo reemplaza
 * (`inventory/utils/format.ts`, de una review de TESIS-163). Al unificar, la
 * heredan todas.
 */
export function formatInteger(value: number): string {
  return Number.isFinite(value) ? INTEGER.format(value) : UNKNOWN_VALUE
}

/** Dos decimales siempre: `1.45` → `"1,45"`. Un peso, una medida. */
export function formatDecimal(value: number): string {
  return Number.isFinite(value) ? DECIMAL.format(value) : UNKNOWN_VALUE
}

/**
 * Importe con centavos: `1478300.49` → `"$ 1.478.300,49"`.
 *
 * Con dos decimales siempre, aunque el diseño los omita: donde se usa es plata
 * facturada, y redondear $ 1.478.300,49 a $ 1.478.300 en pantalla es mostrar
 * un número que no es el de la orden.
 */
export function formatMoney(amount: number): string {
  return Number.isFinite(amount) ? MONEY.format(amount) : UNKNOWN_VALUE
}

/**
 * Importe sin centavos: `58300` → `"$ 58.300"`.
 *
 * Para los costos que se leen de un vistazo en una tabla —el del envío— donde
 * el centavo no cambia ninguna decisión y la columna gana en lectura.
 */
export function formatRoundMoney(amount: number): string {
  return Number.isFinite(amount) ? ROUND_MONEY.format(amount) : UNKNOWN_VALUE
}
