import { screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { OrderLine } from '../../types'

import { OrderItemsTable } from './OrderItemsTable'

const LINES: OrderLine[] = [
  {
    id: 1,
    productId: 12,
    sku: 'PRO-8812-A',
    productName: 'Nodo sensor industrial v3',
    quantity: 8,
    unitPrice: 120000,
  },
  {
    id: 2,
    productId: 40,
    sku: 'ACC-1002-C',
    productName: 'Kit de fibra óptica',
    quantity: 57,
    unitPrice: 3313,
  },
]

function renderTable(lines = LINES) {
  renderWithTheme(
    <MemoryRouter>
      <OrderItemsTable lines={lines} productPath={(id) => `/inventory/${id}`} />
    </MemoryRouter>,
  )
}

describe('OrderItemsTable', () => {
  // Alcance de la card: SKU, producto, precio unitario, cantidad y subtotal.
  it('renders the five columns of the design, in order', () => {
    renderTable()

    const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent)

    expect(headers).toEqual(['SKU', 'Producto', 'P. unitario', 'Cant.', 'Subtotal'])
  })

  it('multiplies the billed price by the quantity in each subtotal', () => {
    renderTable()

    const row = screen.getByRole('row', { name: /ACC-1002-C/ })

    expect(within(row).getByText(/188\.841,00/)).toBeInTheDocument()
  })

  it('links each sku to the detail of its product', () => {
    renderTable()

    expect(screen.getByRole('link', { name: 'PRO-8812-A' })).toHaveAttribute(
      'href',
      '/inventory/12',
    )
  })

  it('counts the lines and the units in the footer', () => {
    renderTable()

    expect(screen.getByText('2 líneas · 65 unidades')).toBeInTheDocument()
  })

  it('uses the singular for a single line of a single unit', () => {
    renderTable([{ ...LINES[0], quantity: 1 }])

    expect(screen.getByText('1 línea · 1 unidad')).toBeInTheDocument()
  })
})
