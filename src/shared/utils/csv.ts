// La exportación a CSV de la app: el reporte del período y la ficha de un
// producto. Se arma del lado del cliente con lo que la pantalla ya tiene en la
// mano —no hay endpoint de exportación—, así que lo que baja es exactamente lo
// que se ve.
//
// Decisiones del formato, que no se notan hasta que alguien abre el archivo:
//
// · Coma como separador y comillas dobles donde hace falta (RFC 4180): es el
//   CSV que leen sin configurar nada Google Sheets, LibreOffice y cualquier
//   script. El `;` que usa Excel en es-AR (donde la coma es el decimal) ataría
//   el archivo a una sola planilla y una sola configuración regional. La
//   contracara: un Excel con `;` como separador de listas, abierto con doble
//   clic, puede poner todo en una columna; ahí se importa con «Datos → Desde
//   texto/CSV», que detecta la coma.
// · BOM de UTF-8 al principio: sin él, Excel lee el archivo como Windows-1252
//   y «Depósito» sale «DepÃ³sito». Las demás planillas lo ignoran.
// · Los números van crudos (`1200.5`), sin punto de miles ni coma decimal: son
//   para hacer cuentas, y un «1.200,50» sería texto para la planilla.
// · Un texto que empieza con `=`, `+`, `-` o `@` se escapa con `'`: lo cargó
//   alguien en un formulario (el nombre de un producto, un depósito), y la
//   planilla lo ejecutaría como fórmula al abrir el archivo.
// · Fin de línea CRLF, el del RFC.

/** Una celda: `null`/`undefined` es una celda vacía, no el texto «null». */
export type CsvCell = string | number | null | undefined

const BOM = '\uFEFF'
const LINE_BREAK = '\r\n'
const NEEDS_QUOTES = /[",\r\n]/
const FORMULA_START = /^[=+\-@\t\r]/

function toField(cell: CsvCell): string {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'number') return Number.isFinite(cell) ? String(cell) : ''

  const text = FORMULA_START.test(cell) ? `'${cell}` : cell
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/** Las filas como texto CSV, sin el BOM (eso es del archivo, no del contenido). */
export function toCsv(rows: CsvCell[][]): string {
  return rows.map((row) => row.map(toField).join(',')).join(LINE_BREAK)
}

/**
 * Descarga las filas como un `.csv`. El enlace se monta sólo para el click: un
 * `<a>` fuera del DOM no descarga en algunos Firefox. La URL se revoca en el
 * tick siguiente y no en el acto, porque Safari todavía la está leyendo cuando
 * `click()` vuelve y revocarla ahí cancela la descarga.
 */
export function downloadCsv(filename: string, rows: CsvCell[][]): void {
  const blob = new Blob([BOM, toCsv(rows), LINE_BREAK], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
