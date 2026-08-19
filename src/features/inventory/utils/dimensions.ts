// El Figma edita largo / ancho / alto por separado, pero `products.dimensions`
// es una sola columna `string` en la API. Estas funciones son el contrato entre
// ambas formas, y el formato canónico se define acá y en ningún otro lado.
//
// Formato: `"<largo>x<ancho>x<alto>"` en centímetros, sin unidades ni espacios.
// Ejemplo: `"45x30x30"`.

export interface Dimensions {
  length: number
  width: number
  height: number
}

const SEPARATOR = 'x'
const EMPTY: Dimensions = { length: 0, width: 0, height: 0 }

// Devuelve los tres ejes, o `null` si el string no sigue el formato canónico.
// El campo es texto libre en la DB y puede tener cargas viejas ("grande",
// "45 x 30"), así que distinguir "no se entiende" de "es cero" importa.
function tryParse(value: string | null | undefined): Dimensions | null {
  if (!value) return null

  const parts = value.toLowerCase().split(SEPARATOR)
  if (parts.length !== 3) return null

  const axes = parts.map((part) => Number.parseFloat(part.trim()))
  if (axes.some((axis) => !Number.isFinite(axis) || axis < 0)) return null

  const [length, width, height] = axes
  return { length, width, height }
}

/**
 * Abre el string de la API en sus tres ejes.
 *
 * Lo que no se entiende cae en 0 en vez de romper el modal: el usuario ve los
 * campos vacíos y puede cargar las medidas bien.
 */
export function parseDimensions(value: string | null | undefined): Dimensions {
  return tryParse(value) ?? EMPTY
}

/**
 * ¿El valor guardado sigue el formato canónico?
 *
 * Lo usa el submit para no pisar con `null` una carga vieja que el formulario
 * no supo mostrar: si no es parseable y el usuario no cargó medidas, se conserva.
 */
export function isParseableDimensions(value: string | null | undefined): boolean {
  return tryParse(value) !== null
}

/**
 * Serializa los tres ejes al string de la API.
 *
 * Devuelve `null` cuando los tres son 0: un producto sin medidas cargadas deja
 * la columna vacía en vez de guardar un `"0x0x0"` que después habría que
 * interpretar como "sin dato".
 */
export function formatDimensions({ length, width, height }: Dimensions): string | null {
  if (length === 0 && width === 0 && height === 0) return null

  return [length, width, height].join(SEPARATOR)
}
