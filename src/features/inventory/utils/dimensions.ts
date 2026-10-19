import { formatMeasure } from 'shared/utils'

// Las medidas del producto en centímetros (TESIS-185). Hasta esa card eran un
// solo texto libre (`"45x30x20"`) que este módulo partía y volvía a armar; la
// API las guarda ahora en tres columnas numéricas —`length_cm`, `width_cm`,
// `height_cm`— porque el courier (OCA) cotiza con el volumen y un texto no se
// puede multiplicar. Cada una es opcional: `null` es «nadie la cargó».

/** Los tres ejes de un producto, en centímetros. */
export interface Dimensions {
  lengthCm: number | null
  widthCm: number | null
  heightCm: number | null
}

/** Marca de «sin dato» del DS, la misma que usa el resto del producto. */
const ABSENT = '—'

/**
 * Lee una medida de la API. Viene como número, pero un decimal de Rails se
 * serializa como string si el serializer no lo convierte: se aceptan las dos
 * formas para no depender de ese detalle. Lo que no es un número positivo es
 * «sin dato», nunca un cero que después habría que interpretar.
 */
export function toCentimeters(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null

  const centimeters = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(centimeters) && centimeters > 0 ? centimeters : null
}

/** ¿Tiene cargada al menos una medida? */
export function hasDimensions({ lengthCm, widthCm, heightCm }: Dimensions): boolean {
  return lengthCm !== null || widthCm !== null || heightCm !== null
}

/**
 * Las medidas como las lee el operador: `"16,5 × 7,8 × 0,9 cm"`, en el orden
 * largo × ancho × alto. Sin ninguna medida sale «—»; con alguna suelta, el eje
 * que falta va con «—» y no se inventa.
 */
export function formatDimensions(dimensions: Dimensions): string {
  if (!hasDimensions(dimensions)) return ABSENT

  const axes = [dimensions.lengthCm, dimensions.widthCm, dimensions.heightCm].map((axis) =>
    axis === null ? ABSENT : formatMeasure(axis),
  )

  return `${axes.join(' × ')} cm`
}

/** Un número con punto o coma decimal: `16.5`, `16,5`, `,5`. El signo se deja
 * pasar para que un negativo muestre «tiene que ser mayor a 0». */
const TYPED_MEASURE = /^-?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/

/**
 * Lo que entrega el input de una medida al formulario: el campo vacío es `null`
 * (la medida es opcional), y lo que no es un número es `NaN`, que el schema
 * rechaza como «ingresá un número».
 *
 * El input es de texto y no `type="number"`: con este, lo que el navegador no
 * entiende (`16-`, `1e`, `16.5.2`) llega como `""`, igual que un campo vacío, y
 * se guardaba en silencio como «sin medida», borrando la que había. Y en Chrome
 * con el idioma en español, `16,5` quedaba en `165`. Acá la coma es decimal.
 */
export function measureFromInput(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value === null || value === undefined) return null

  const typed = String(value).trim()
  if (typed === '') return null

  return TYPED_MEASURE.test(typed) ? Number(typed.replace(',', '.')) : Number.NaN
}
