// Formato de las celdas del listado. Vive acá y no en el componente para que
// cada regla se pueda probar sin montar la tabla.

const MONEY = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const DATE = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

// `hourCycle: 'h23'` y no `hour12: false`: en es-AR, el segundo deja el reloj
// en el ciclo h24 y la medianoche sale como «24:14» en vez de «00:14».
const TIME = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Importe de la orden.
 *
 * Con dos decimales siempre, aunque el diseño los omita: esta columna es plata
 * facturada y redondear $ 1.478.300,49 a $ 1.478.300 en pantalla es mostrar un
 * número que no es el de la orden.
 */
export function formatMoney(amount: number): string {
  return MONEY.format(amount)
}

/** "24 ago 2026" — la línea principal de la columna de fecha. */
export function formatOrderDate(iso: string): string {
  return DATE.format(new Date(iso))
}

/** "09:14" — la línea secundaria, en 24 horas. */
export function formatOrderTime(iso: string): string {
  return TIME.format(new Date(iso))
}

/**
 * Lo que se muestra en la columna «ID de orden».
 *
 * Se prefiere el identificador del canal externo, que es con el que el operador
 * conoce la venta y con el que la va a buscar. Las ventas cargadas a mano no
 * tienen uno, y ahí se cae al id interno para que la columna nunca quede vacía:
 * es la que abre el detalle.
 */
export function formatOrderId(externalOrderId: string | null, id: number): string {
  return `#${externalOrderId ?? id}`
}
