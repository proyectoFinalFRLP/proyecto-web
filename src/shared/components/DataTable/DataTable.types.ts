import type { Breakpoint } from '@mui/material/styles'
import type { ReactNode } from 'react'

export type DataTableAlign = 'left' | 'right' | 'center'

/**
 * Énfasis de una fila. `critical` pinta el fondo con el tono de error (la fila
 * retenida en aduana del diseño) y `muted` la atenúa (la ya entregada): son
 * estados del negocio, no del componente, así que los decide quien lo consume.
 */
export type DataTableRowTone = 'default' | 'critical' | 'muted'

/**
 * Alto de las filas. `regular` es el listado a pantalla completa (66px);
 * `compact` es la tabla que vive dentro de un formulario (52px), donde una
 * fila alta compite con los campos que la rodean.
 */
export type DataTableDensity = 'regular' | 'compact'

export interface DataTableColumn<Row> {
  id: string
  header: string
  /** Por defecto `left`. Los importes van `right` y las acciones `center`. */
  align?: DataTableAlign
  /** Ancho fijo en px. Sin esto la columna reparte el espacio sobrante. */
  width?: number
  /**
   * Esconde la columna (encabezado y celdas) por debajo de este breakpoint.
   *
   * Es la prioridad de columnas: en una pantalla angosta —el proyector de
   * 800×600— lo secundario (fecha, operador, depósito) se va para que el
   * estado, el importe y las acciones entren sin scroll horizontal. Se mide
   * contra el viewport y no contra la tabla: debajo de `lg` la sidebar flota
   * y el contenido ya ocupa todo el ancho, así que los dos coinciden.
   */
  hideBelow?: Breakpoint
  /**
   * Fija la columna contra el borde derecho de la tabla, con fondo opaco, para
   * que quede a mano aunque la tabla scrollee. Es para la columna de acciones
   * que arma la propia feature (botones en la fila en vez del kebab); la de
   * `actions` ya viene fijada. Sólo tiene sentido en la última columna: dos
   * fijadas con `right: 0` se apilarían una sobre otra.
   */
  pinned?: boolean
  /**
   * El contenido no estira la columna: se queda con el ancho que le dejan las
   * demás y lo que no entra se corta (la elipsis la pone quien renderiza, como
   * `StackedCell`). Es para el texto libre que, largo, empujaría el estado y
   * el importe fuera de la vista. Va en una sola columna sin `width` por
   * tabla: el sobrante se reparte según el ancho del contenido, y una columna
   * que declara no tener ninguno no recibiría nada al lado de otra que sí.
   */
  truncate?: boolean
  render: (row: Row) => ReactNode
}

export interface DataTableTab {
  id: string
  label: string
  /** Contador entre paréntesis. Ya viene formateado ("1.2K", "342"). */
  count?: string
}

export interface DataTableAction<Row> {
  id: string
  label: string
  icon?: ReactNode
  /** `danger` pinta la acción con el color de error (ej. Eliminar). */
  tone?: 'default' | 'danger'
  onSelect: (row: Row) => void
}

export interface DataTablePagination {
  /** Página actual, base 1. */
  page: number
  pageCount: number
  /** Resumen ya armado ("Mostrando 1 a 5 de 4.829 órdenes"). */
  summary: string
  onPageChange: (page: number) => void
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  /** Identidad estable de cada fila: key de React y clave de selección. */
  getRowId: (row: Row) => string | number
  /** Nombre accesible de la tabla; se anuncia como `<caption>` visualmente oculto. */
  label: string

  tabs?: DataTableTab[]
  activeTabId?: string
  onTabChange?: (tabId: string) => void

  /** Muestra la columna de checkboxes con su selector de "todo". */
  selectable?: boolean
  selectedIds?: readonly (string | number)[]
  onSelectionChange?: (ids: (string | number)[]) => void

  rowTone?: (row: Row) => DataTableRowTone

  actions?: DataTableAction<Row>[]
  /** Etiqueta accesible del kebab de cada fila. */
  getActionsLabel?: (row: Row) => string
  /** Encabezado de la columna de acciones. */
  actionsHeader?: string

  /** Etiquetas accesibles de los checkboxes. */
  selectAllLabel?: string
  selectRowLabel?: string

  pagination?: DataTablePagination
  /** Textos del paginador. Sin esto el paginador no se renderiza. */
  paginationLabels?: DataTablePaginationLabels
  /** Acciones del extremo derecho de la barra (filtros, columnas). */
  toolbarActions?: ReactNode
  emptyMessage?: string
  /**
   * Título de la tabla, en la barra superior. Es para las tablas que viven
   * dentro de una pantalla ("Líneas de la orden"); con `tabs` no se muestra,
   * porque las pestañas ocupan ese lugar.
   */
  title?: string
  /**
   * Texto del pie ("3 líneas · 67 unidades"). Con `pagination` no se muestra:
   * el paginador ya trae su propio resumen.
   */
  footer?: string
  /** Por defecto `regular`. Ver `DataTableDensity`. */
  density?: DataTableDensity
}

/**
 * Todo el copy va por props: este componente es compartido y no puede traer
 * textos propios — ver el patrón de `content.ts` en las features.
 */
export interface DataTablePaginationLabels {
  previousLabel: string
  nextLabel: string
  pageLabel: (page: number) => string
}

export interface DataTableTabsProps {
  tabs: DataTableTab[]
  activeTabId?: string
  onTabChange?: (tabId: string) => void
  label: string
}

export interface DataTableRowActionsProps<Row> {
  row: Row
  actions: DataTableAction<Row>[]
  label: string
}

export interface DataTablePaginationBarProps
  extends DataTablePagination, DataTablePaginationLabels {}
