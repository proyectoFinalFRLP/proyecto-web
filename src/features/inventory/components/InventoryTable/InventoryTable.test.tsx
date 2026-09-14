import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { ProductSummary } from '../../types'

import { InventoryTable } from './InventoryTable'

function product(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 8842,
    sku: 'SKU-8842-PL',
    name: 'Arreglo de sensores serie G',
    category: 'Electronics',
    totalStock: 2710,
    stockStatus: 'available',
    inTransitQuantity: 0,
    primaryWarehouse: { id: 1, name: 'CD Ezeiza', quantity: 2710 },
    warehouseCount: 1,
    ...overrides,
  }
}

function renderTable(
  rows: ProductSummary[],
  handlers: Partial<Parameters<typeof InventoryTable>[0]> = {},
) {
  const props = {
    products: rows,
    tabs: [{ id: 'all', label: 'Todos', count: '1' }],
    activeTabId: 'all',
    onTabChange: vi.fn(),
    pagination: {
      page: 1,
      pageCount: 1,
      summary: 'Mostrando 1 a 1 de 1 producto',
      onPageChange: vi.fn(),
    },
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...handlers,
  }

  renderWithTheme(<InventoryTable {...props} />)

  return props
}

describe('InventoryTable', () => {
  // Criterio de finalización de la card: las columnas en este orden.
  it('renders the columns of the design, in order', () => {
    renderTable([product()])

    const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent)

    expect(headers).toEqual([
      'SKU',
      'Nombre',
      'Categoría',
      'Disponible',
      'Estado',
      'Depósito',
      'Acciones',
    ])
  })

  it('groups the available units with thousands separators', () => {
    renderTable([product()])

    expect(screen.getByText('2.710')).toBeInTheDocument()
  })

  it('shows the status translated', () => {
    renderTable([product({ stockStatus: 'low' })])

    expect(screen.getByText('Stock bajo')).toBeInTheDocument()
  })

  it('shows the warehouse where most of the units are', () => {
    renderTable([product()])

    expect(screen.getByText('CD Ezeiza')).toBeInTheDocument()
  })

  it('says how many warehouses hold the product when there is more than one', () => {
    renderTable([product({ warehouseCount: 3 })])

    expect(screen.getByText('en 3 depósitos')).toBeInTheDocument()
  })

  it('does not mention the count when the product is in a single warehouse', () => {
    renderTable([product({ warehouseCount: 1 })])

    expect(screen.queryByText(/en 1 depósito/)).not.toBeInTheDocument()
  })

  /**
   * Las unidades en tránsito van aparte y no sumadas al disponible: salieron de
   * un depósito y todavía no llegaron a otro, así que no son stock en ningún
   * nodo. Sumarlas diría que hay mercadería que no está en ningún lado.
   */
  it('reports the units in transit apart from the available ones', () => {
    renderTable([product({ totalStock: 100, inTransitQuantity: 1200 })])

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('+1.200 en tránsito')).toBeInTheDocument()
  })

  it('says nothing about transit when there is nothing in transit', () => {
    renderTable([product({ inTransitQuantity: 0 })])

    expect(screen.queryByText(/en tránsito/)).not.toBeInTheDocument()
  })

  describe('when the product has no data behind a column', () => {
    it('marks the missing category', () => {
      renderTable([product({ category: null })])

      expect(screen.getByText('Sin categoría')).toBeInTheDocument()
    })

    // Un producto sin unidades en ningún depósito no tiene nodo que mostrar, y
    // eso no es lo mismo que tener 0 en uno conocido.
    it('marks the missing warehouse instead of leaving a blank cell', () => {
      renderTable([product({ primaryWarehouse: null, warehouseCount: 0, totalStock: 0 })])

      expect(screen.getByText('Sin asignar')).toBeInTheDocument()
    })
  })

  describe('the row actions', () => {
    it('opens the detail from the sku', () => {
      const row = product()
      const { onView } = renderTable([row])

      fireEvent.click(screen.getByRole('button', { name: 'SKU-8842-PL' }))

      expect(onView).toHaveBeenCalledWith(row)
    })

    it('opens the detail from the actions menu', () => {
      const row = product()
      const { onView } = renderTable([row])

      fireEvent.click(screen.getByRole('button', { name: 'Acciones del producto SKU-8842-PL' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Ver' }))

      expect(onView).toHaveBeenCalledWith(row)
    })

    it('opens the edit modal from the actions menu', () => {
      const row = product()
      const { onEdit } = renderTable([row])

      fireEvent.click(screen.getByRole('button', { name: 'Acciones del producto SKU-8842-PL' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Editar' }))

      expect(onEdit).toHaveBeenCalledWith(row)
    })

    // Borrar no ejecuta nada por sí solo: pide confirmación, porque la baja no
    // se puede deshacer.
    it('asks to delete rather than deleting', () => {
      const row = product()
      const { onDelete } = renderTable([row])

      fireEvent.click(screen.getByRole('button', { name: 'Acciones del producto SKU-8842-PL' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Eliminar' }))

      expect(onDelete).toHaveBeenCalledWith(row)
    })
  })

  it('shows the empty message instead of an empty table body', () => {
    renderTable([])

    expect(screen.getByText('No hay productos que coincidan con el filtro.')).toBeInTheDocument()
  })
})
