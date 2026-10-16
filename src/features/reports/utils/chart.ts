// Geometría de la curva de despacho. Son funciones puras sobre números: el
// componente sólo las pinta. Así la escala del eje, la posición de cada punto y
// el suavizado se prueban sin montar un SVG.

export interface ChartFrame {
  /** Ancho y alto del `viewBox`. El SVG se estira al contenedor (`none`). */
  width: number
  height: number
  /**
   * Margen vertical dentro del lienzo, para que el trazo (3px) y la primera
   * línea de la grilla no queden cortados por el borde del `viewBox`.
   */
  inset: number
}

export interface ChartPoint {
  x: number
  y: number
}

/** Lienzo de S14: 640×220 con la grilla de 6 a 214. */
export const CHART_FRAME: ChartFrame = { width: 640, height: 220, inset: 6 }

/** Cinco rótulos en el eje Y (cuatro intervalos), como en el diseño. */
export const TICK_COUNT = 5

// Pasos posibles entre dos ticks, por orden de magnitud. El 2,5 sólo entra
// cuando da un entero (25, 250, 2.500…): con un techo de 10 y cuatro
// intervalos los ticks eran 2,5 y 7,5, el formato del eje los redondeaba a «3»
// y «8», y el número no era el de su línea (TESIS-183). Con un paso entero el
// texto de cada tick es exactamente su valor, y en la serie de órdenes —que se
// cuentan de a una— no aparece media orden.
//
// El 3 evita los saltos más grandes: sin él, de 2 a 5 por intervalo, un máximo
// de 9 órdenes llevaba el eje a 20 y la curva usaba menos de la mitad del alto.
// Con él va a 12.
const STEP_MANTISSAS = [1, 2, 2.5, 3, 5, 10]

const INTERVALS = TICK_COUNT - 1

// Con una serie vacía o toda en cero no hay magnitud de la que partir: el eje
// va de 0 a 4, de a uno, para que la grilla se dibuje igual y no quede un
// lienzo mudo.
const EMPTY_CEILING = INTERVALS

/** El menor paso «redondo» y entero que alcanza para repartir `raw` por intervalo. */
function tickStep(raw: number): number {
  if (raw <= 1) return 1

  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = STEP_MANTISSAS.map((mantissa) => mantissa * magnitude)
    .filter((candidate) => Number.isInteger(candidate))
    .find((candidate) => candidate >= raw)

  return step ?? 10 * magnitude
}

/**
 * Techo del eje Y para una serie: cuatro pasos redondos y enteros (1, 2, 2,5, 3
 * o 5 por su orden de magnitud) que cubren el máximo. Así 7 órdenes suben a 8
 * —ticks de a 2—, 9.400 pesos a 10.000 —de a 2.500— y 740.000 a 800.000.
 */
export function niceCeiling(values: readonly number[]): number {
  const max = Math.max(0, ...values)
  if (max === 0) return EMPTY_CEILING

  return tickStep(max / INTERVALS) * INTERVALS
}

/** Los valores del eje Y, de arriba hacia abajo: `[techo, …, 0]`. */
export function axisTicks(ceiling: number, count = TICK_COUNT): number[] {
  const intervals = count - 1
  return Array.from({ length: count }, (_, index) => (ceiling * (intervals - index)) / intervals)
}

/** La coordenada Y de cada tick, de arriba hacia abajo, dentro del margen. */
export function tickOffsets(frame: ChartFrame, count = TICK_COUNT): number[] {
  const span = frame.height - frame.inset * 2
  const intervals = count - 1
  return Array.from({ length: count }, (_, index) => frame.inset + (span * index) / intervals)
}

/**
 * Cada valor de la serie como un punto del lienzo: X reparte el ancho en
 * partes iguales (el primero en 0, el último en `width`) y Y escala contra el
 * techo del eje, invertida porque en SVG el 0 está arriba.
 */
export function plotPoints(
  values: readonly number[],
  ceiling: number,
  frame: ChartFrame = CHART_FRAME,
): ChartPoint[] {
  const span = frame.height - frame.inset * 2
  const stepX = values.length > 1 ? frame.width / (values.length - 1) : 0

  return values.map((value, index) => ({
    x: index * stepX,
    y: frame.inset + span * (1 - Math.min(Math.max(value, 0), ceiling) / ceiling),
  }))
}

// Un decimal alcanza para un lienzo de 640×220 y mantiene el `d` legible.
function coord(value: number) {
  return Number(value.toFixed(1))
}

function sign(value: number): number {
  return value < 0 ? -1 : 1
}

/**
 * Pendiente del trazo en un punto interior, entre el tramo que llega y el que
 * sale. Si uno sube y el otro baja —un pico, un valle, un día en cero entre
 * dos con ventas— la pendiente es 0: la curva se aplana ahí en vez de pasarse
 * de largo. Si no, es la menor de las dos, acotada para que el tramo no salga
 * del rango entre sus dos puntos (Fritsch-Carlson, la `curveMonotoneX` de d3).
 */
function interiorSlope(before: ChartPoint, point: ChartPoint, after: ChartPoint): number {
  const h0 = point.x - before.x
  const h1 = after.x - point.x
  const s0 = h0 === 0 ? 0 : (point.y - before.y) / h0
  const s1 = h1 === 0 ? 0 : (after.y - point.y) / h1
  const weighted = h0 + h1 === 0 ? 0 : (s0 * h1 + s1 * h0) / (h0 + h1)

  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(weighted))
}

/** Pendiente en un extremo, a partir de la del punto vecino. */
function edgeSlope(from: ChartPoint, to: ChartPoint, neighborSlope: number): number {
  const h = to.x - from.x
  return h === 0 ? neighborSlope : (3 * (to.y - from.y)) / h / 2 - neighborSlope / 2
}

function slopes(points: readonly ChartPoint[]): number[] {
  const last = points.length - 1
  const interior = points.map((point, index) =>
    index === 0 || index === last ? 0 : interiorSlope(points[index - 1], point, points[index + 1]),
  )

  if (last === 1) {
    // Dos puntos: una recta, con la misma pendiente en los dos extremos.
    const straight = (points[1].y - points[0].y) / (points[1].x - points[0].x || 1)
    return [straight, straight]
  }

  interior[0] = edgeSlope(points[0], points[1], interior[1])
  interior[last] = edgeSlope(points[last - 1], points[last], interior[last - 1])
  return interior
}

/**
 * Trazo suave por todos los puntos, monótono entre cada par (TESIS-183). La
 * curva anterior (Catmull-Rom) pasaba por cada valor pero se pasaba de largo
 * entre ellos: en un día sin órdenes entre dos con ventas bajaba por debajo
 * del piso —órdenes negativas— y en un pico subía más que el valor real. Con
 * pendientes monótonas cada tramo queda entre sus dos puntos: toca el cero sin
 * cruzarlo y el pico es el pico.
 *
 * Con un solo punto no hay tramo que dibujar y el path queda vacío.
 */
export function linePath(points: readonly ChartPoint[]): string {
  if (points.length < 2) return ''

  const tangents = slopes(points)
  const [first] = points
  const segments = points.slice(1).map((current, index) => {
    // `index` es la posición de `previous` en `points` (el slice corre uno).
    const previous = points[index]
    const third = (current.x - previous.x) / 3

    const control1 = { x: previous.x + third, y: previous.y + third * tangents[index] }
    const control2 = { x: current.x - third, y: current.y - third * tangents[index + 1] }

    return `C${coord(control1.x)},${coord(control1.y)} ${coord(control2.x)},${coord(control2.y)} ${coord(current.x)},${coord(current.y)}`
  })

  return `M${coord(first.x)},${coord(first.y)} ${segments.join(' ')}`
}

/** El mismo trazo cerrado contra el piso del lienzo, para el relleno bajo la curva. */
export function areaPath(points: readonly ChartPoint[], frame: ChartFrame = CHART_FRAME): string {
  const line = linePath(points)
  if (line === '') return ''

  const last = points[points.length - 1]
  const [first] = points

  return `${line} L${coord(last.x)},${frame.height} L${coord(first.x)},${frame.height} Z`
}

/**
 * Cada cuántos puntos va un rótulo del eje X para que entren en `width`, si
 * cada uno necesita `slot` px. Uno por punto mientras entren; si no, uno cada
 * N (un día de cada dos, de cada cuatro…), así a 30 días en 800px los rótulos
 * no se pisan ni se salen de la tarjeta.
 *
 * Sin un ancho medido (`undefined` o `0`: todavía no hay layout, o la tarjeta
 * está oculta) no hay con qué decidir, y no se esconde nada.
 */
export function labelStep(count: number, width: number | undefined, slot: number): number {
  if (!width || count <= 1) return 1

  const fitting = Math.max(1, Math.floor(width / slot))
  return Math.max(1, Math.ceil(count / fitting))
}
