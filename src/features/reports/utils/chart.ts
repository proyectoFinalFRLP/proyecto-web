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

// Techos posibles del eje, normalizados a su orden de magnitud. Con cuatro
// intervalos cada uno da ticks «redondos» (10 → 2,5 · 4 → 1 · 2 → 0,5 · 1 →
// 0,25); un techo de 5 daría 1,25 · 2,5 · 3,75, que en el eje se leen mal.
const CEILING_STEPS = [1, 2, 4, 10]

// Con una serie vacía o toda en cero no hay magnitud de la que partir: el eje
// va de 0 a 10 para que la grilla se dibuje igual y no quede un lienzo mudo.
const EMPTY_CEILING = 10

/**
 * Techo del eje Y para una serie: el primer número redondo (1, 2, 4 o 10 por su
 * orden de magnitud) que cubre el máximo. Así 9.400 sube a 10.000 y 740.000 a
 * 1.000.000, y los ticks intermedios salen enteros o con medio decimal.
 */
export function niceCeiling(values: readonly number[]): number {
  const max = Math.max(0, ...values)
  if (max === 0) return EMPTY_CEILING

  const magnitude = 10 ** Math.floor(Math.log10(max))
  const normalized = max / magnitude
  const step = CEILING_STEPS.find((candidate) => candidate >= normalized) ?? 10

  return step * magnitude
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

/**
 * Trazo suave por todos los puntos (Catmull-Rom convertido a Bézier cúbica),
 * la misma curva que dibuja el diseño. Cada tramo toma como tangente la
 * dirección entre sus vecinos, así la línea pasa por cada valor sin quebrarse.
 *
 * Con un solo punto no hay tramo que dibujar y el path queda vacío.
 */
export function linePath(points: readonly ChartPoint[]): string {
  if (points.length < 2) return ''

  const [first] = points
  const segments = points.slice(1).map((current, index) => {
    // `index` es la posición de `previous` en `points` (el slice corre uno).
    const previous = points[index]
    const before = points[index - 1] ?? previous
    const after = points[index + 2] ?? current

    const control1 = {
      x: previous.x + (current.x - before.x) / 6,
      y: previous.y + (current.y - before.y) / 6,
    }
    const control2 = {
      x: current.x - (after.x - previous.x) / 6,
      y: current.y - (after.y - previous.y) / 6,
    }

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
