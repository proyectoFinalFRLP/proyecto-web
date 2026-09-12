import { Checkbox, Table, TableBody, TableHead, TableRow, Typography } from '@mui/material'

import {
  BodyCell,
  BodyRow,
  EmptyState,
  HeadCell,
  Scroller,
  SelectCell,
  TableCard,
  Toolbar,
  ToolbarActions,
} from './DataTable.styles'
import type { DataTableProps } from './DataTable.types'
import { DataTablePaginationBar } from './DataTablePaginationBar'
import { DataTableRowActions } from './DataTableRowActions'
import { DataTableTabs } from './DataTableTabs'

/**
 * Tabla de datos estándar del design system: pestañas de filtrado, selección
 * por fila, celdas con formato libre, menú de acciones y paginación.
 *
 * Es **presentacional y genérica**: no sabe qué son las filas ni de dónde
 * salen. El formato de cada celda —moneda, fecha, id, badge— lo resuelve el
 * `render` de su columna, así la tabla no acumula reglas de dominio.
 *
 * En pantallas angostas scrollea horizontalmente en vez de colapsar: siete
 * columnas apiladas dejan de ser una tabla y se vuelven ilegibles.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  label,
  tabs,
  activeTabId,
  onTabChange,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  rowTone,
  actions,
  getActionsLabel,
  actionsHeader = 'Acciones',
  selectAllLabel = 'Seleccionar todo',
  selectRowLabel = 'Seleccionar fila',
  pagination,
  paginationLabels,
  toolbarActions,
  emptyMessage,
}: DataTableProps<Row>) {
  const selected = new Set(selectedIds)
  const visibleIds = rows.map(getRowId)

  const allSelected = rows.length > 0 && visibleIds.every((id) => selected.has(id))
  // Indeterminado sólo si hay algo tildado pero no todo: con la tabla vacía no
  // corresponde ningún estado intermedio.
  const someSelected = visibleIds.some((id) => selected.has(id)) && !allSelected

  function toggleAll() {
    // El "todo" opera sólo sobre las filas visibles: lo tildado en otra página
    // no se pierde por cambiar de página y volver.
    const next = new Set(selected)
    if (allSelected) visibleIds.forEach((id) => next.delete(id))
    else visibleIds.forEach((id) => next.add(id))
    onSelectionChange?.([...next])
  }

  function toggleRow(id: string | number) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange?.([...next])
  }

  const hasToolbar = tabs !== undefined || toolbarActions !== undefined

  return (
    <TableCard>
      {hasToolbar ? (
        <Toolbar>
          {tabs === undefined ? (
            <span />
          ) : (
            <DataTableTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={onTabChange}
              label={label}
            />
          )}
          {toolbarActions === undefined ? null : <ToolbarActions>{toolbarActions}</ToolbarActions>}
        </Toolbar>
      ) : null}

      <Scroller>
        <Table aria-label={label}>
          <TableHead>
            <TableRow>
              {selectable ? (
                <HeadCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    inputProps={{ 'aria-label': selectAllLabel }}
                    size="small"
                  />
                </HeadCell>
              ) : null}

              {columns.map((column) => (
                <HeadCell
                  key={column.id}
                  align={column.align ?? 'left'}
                  style={column.width === undefined ? undefined : { width: column.width }}
                >
                  {column.header}
                </HeadCell>
              ))}

              {actions === undefined ? null : <HeadCell align="center">{actionsHeader}</HeadCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.has(id)

              return (
                <BodyRow key={id} tone={rowTone?.(row) ?? 'default'} selected={isSelected}>
                  {selectable ? (
                    <SelectCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        inputProps={{ 'aria-label': selectRowLabel }}
                        size="small"
                      />
                    </SelectCell>
                  ) : null}

                  {columns.map((column) => (
                    <BodyCell key={column.id} align={column.align ?? 'left'}>
                      {column.render(row)}
                    </BodyCell>
                  ))}

                  {actions === undefined ? null : (
                    <BodyCell align="center">
                      <DataTableRowActions
                        row={row}
                        actions={actions}
                        label={getActionsLabel?.(row) ?? actionsHeader}
                      />
                    </BodyCell>
                  )}
                </BodyRow>
              )
            })}
          </TableBody>
        </Table>
      </Scroller>

      {rows.length === 0 && emptyMessage !== undefined ? (
        <EmptyState>
          <Typography variant="bodyMd">{emptyMessage}</Typography>
        </EmptyState>
      ) : null}

      {pagination === undefined || paginationLabels === undefined ? null : (
        <DataTablePaginationBar {...pagination} {...paginationLabels} />
      )}
    </TableCard>
  )
}
