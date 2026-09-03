import type { ReactNode } from 'react'

export type DataTableAlign = 'left' | 'right' | 'center'

/**
 * Énfasis de una fila. `critical` pinta el fondo con el tono de error (la fila
 * retenida en aduana del diseño) y `muted` la atenúa (la ya entregada): son
 * estados del negocio, no del componente, así que los decide quien lo consume.
 */
export type DataTableRowTone = 'default' | 'critical' | 'muted'

export interface DataTableColumn<Row> {
  id: string
  header: string
  /** Por defecto `left`. Los importes van `right` y las acciones `center`. */
  align?: DataTableAlign
  /** Ancho fijo en px. Sin esto la columna reparte el espacio sobrante. */
  width?: number
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
