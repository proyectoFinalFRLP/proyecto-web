import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { DataTable } from './DataTable'
import type { DataTableProps } from './DataTable.types'

interface Row {
  id: number
  name: string
}

function renderTable(props: Partial<DataTableProps<Row>> = {}) {
  return renderWithTheme(
    <DataTable<Row>
      columns={[{ id: 'name', header: 'Nombre', render: (row) => row.name }]}
      rows={[{ id: 1, name: 'Kit de fibra óptica' }]}
      getRowId={(row) => row.id}
      label="Tabla de prueba"
      {...props}
    />,
  )
}

/**
 * Lo que una regla `@media` le hace a este elemento: `"<condición> <propiedad>: <valor>"`.
 *
 * jsdom aplica las reglas comunes a `getComputedStyle` pero no evalúa media
 * queries —no tiene viewport que medir—, así que lo que pasa debajo de un
 * breakpoint se lee de la hoja de estilos que emitió Emotion.
 */
function mediaRulesFor(element: Element): string[] {
  return Array.from(document.styleSheets).flatMap((sheet) =>
    Array.from(sheet.cssRules)
      .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule)
      .flatMap((media) =>
        Array.from(media.cssRules)
          .filter(
            (rule): rule is CSSStyleRule =>
              rule instanceof CSSStyleRule && element.matches(rule.selectorText),
          )
          .flatMap((rule) =>
            Array.from(rule.style).map(
              (property) =>
                `${media.conditionText} ${property}: ${rule.style.getPropertyValue(property)}`,
            ),
          ),
      ),
  )
}

const ACTIONS = { actions: [{ id: 'view', label: 'Ver', onSelect: vi.fn() }] }

const PAGINATION = {
  pagination: { page: 1, pageCount: 1, summary: 'Mostrando 1 a 1 de 1', onPageChange: vi.fn() },
  paginationLabels: {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
    pageLabel: (page: number) => `Página ${page}`,
  },
}

describe('DataTable', () => {
  it('shows the title as a heading of the table', () => {
    renderTable({ title: 'Líneas de la orden' })

    expect(screen.getByRole('heading', { name: 'Líneas de la orden' })).toBeInTheDocument()
  })

  // Las pestañas ocupan el lugar del título en la barra.
  it('leaves the title out when the table has tabs', () => {
    renderTable({ title: 'Líneas de la orden', tabs: [{ id: 'all', label: 'Todas' }] })

    expect(screen.queryByRole('heading', { name: 'Líneas de la orden' })).not.toBeInTheDocument()
  })

  it('shows the footer text when there is no paginator', () => {
    renderTable({ footer: '3 líneas · 67 unidades' })

    expect(screen.getByText('3 líneas · 67 unidades')).toBeInTheDocument()
  })

  // El paginador ya trae su resumen: dos textos en el pie competirían.
  it('gives the footer way to the paginator summary', () => {
    renderTable({ footer: '3 líneas · 67 unidades', ...PAGINATION })

    expect(screen.queryByText('3 líneas · 67 unidades')).not.toBeInTheDocument()
    expect(screen.getByText('Mostrando 1 a 1 de 1')).toBeInTheDocument()
  })

  describe('narrow screens', () => {
    const columns: DataTableProps<Row>['columns'] = [
      { id: 'name', header: 'Nombre', render: (row) => row.name },
      { id: 'date', header: 'Fecha', hideBelow: 'md', render: () => '12/10/2026' },
    ]

    // El breakpoint `md` del DS es 1024px: debajo, la columna se va entera —el
    // encabezado y cada una de sus celdas—, si no la tabla queda desalineada.
    it('hides the header and the cells of a column below its breakpoint', () => {
      renderTable({ columns })

      const hidden = '(max-width:1023.95px) display: none'
      expect(mediaRulesFor(screen.getByRole('columnheader', { name: 'Fecha' }))).toContain(hidden)
      expect(mediaRulesFor(screen.getByRole('cell', { name: '12/10/2026' }))).toContain(hidden)
    })

    it('keeps the columns without a breakpoint on every screen', () => {
      renderTable({ columns })

      expect(mediaRulesFor(screen.getByRole('columnheader', { name: 'Nombre' }))).not.toContain(
        '(max-width:1023.95px) display: none',
      )
      expect(screen.getByRole('cell', { name: 'Kit de fibra óptica' })).toBeVisible()
    })

    // La columna de acciones queda a mano aunque la tabla scrollee.
    it('pins the actions column to the right edge', () => {
      renderTable(ACTIONS)

      expect(screen.getByRole('columnheader', { name: 'Acciones' })).toHaveStyle({
        position: 'sticky',
        right: '0px',
      })
      expect(screen.getByRole('button', { name: 'Acciones' }).closest('td')).toHaveStyle({
        position: 'sticky',
        right: '0px',
      })
      expect(screen.getByRole('cell', { name: 'Kit de fibra óptica' })).not.toHaveStyle({
        position: 'sticky',
      })
    })

    // Las demás celdas son transparentes: la fijada, no. Pinta el papel de la
    // tarjeta y encima el relleno de su fila (hover, crítica, seleccionada), así
    // tapa lo que scrollea por debajo y se sigue viendo igual que su fila.
    it('paints the pinned cell opaque, with the fill of its row on top', () => {
      renderTable(ACTIONS)

      const pinned = getComputedStyle(
        screen.getByRole('button', { name: 'Acciones' }).closest('td') as Element,
      )
      expect(pinned.backgroundColor).toBe('var(--mui-palette-background-paper)')
      expect(pinned.backgroundImage).toContain('var(--DataTable-rowFill)')
      expect(
        getComputedStyle(screen.getByRole('row', { name: /Kit de fibra/ })).backgroundColor,
      ).toBe('var(--DataTable-rowFill)')
    })

    // Las features que arman su propia columna de acciones (botones en la fila)
    // la fijan con `pinned`.
    it('pins a column of the feature that asks for it', () => {
      renderTable({
        columns: [
          { id: 'name', header: 'Nombre', render: (row) => row.name },
          { id: 'retry', header: 'Reintentar', pinned: true, render: () => 'Reintentar ahora' },
        ],
      })

      expect(screen.getByRole('columnheader', { name: 'Reintentar' })).toHaveStyle({
        position: 'sticky',
      })
      expect(screen.getByRole('cell', { name: 'Reintentar ahora' })).toHaveStyle({
        position: 'sticky',
        right: '0px',
      })
    })

    // Una columna `truncate` no estira la tabla con su texto: el contenido va
    // en una caja de ancho cero que después ocupa la celda.
    it('lets a truncated column give up the width of its content', () => {
      renderTable({
        columns: [{ id: 'name', header: 'Nombre', truncate: true, render: (row) => row.name }],
      })

      expect(screen.getByText('Kit de fibra óptica')).toHaveStyle({
        width: '0px',
        minWidth: '100%',
        overflow: 'hidden',
      })
    })
  })
})
