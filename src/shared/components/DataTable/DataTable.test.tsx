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
})
