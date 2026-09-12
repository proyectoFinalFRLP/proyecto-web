import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { OrderSummary } from '../../types'

import { OrdersTable } from './OrdersTable'

function order(overrides: Partial<OrderSummary> = {}): OrderSummary {
  return {
    id: 8829,
    externalOrderId: 'ORD-8829-X',
    customerName: 'Ferretería Pérez',
    customerAddress: 'Av. Rivadavia 1234',
    customerZipCode: '1406',
    status: 'paid',
    carrier: 'Correo Argentino',
    totalAmount: 1478300,
    itemCount: 3,
    createdAt: '2026-08-24T12:14:00Z',
    ...overrides,
  }
}

function renderTable(
  rows: OrderSummary[],
  handlers: Partial<Parameters<typeof OrdersTable>[0]> = {},
) {
  const props = {
    orders: rows,
    tabs: [{ id: 'all', label: 'Todas', count: '1' }],
    activeTabId: 'all',
    onTabChange: vi.fn(),
    pagination: {
      page: 1,
      pageCount: 1,
      summary: 'Mostrando 1 a 1 de 1 orden',
      onPageChange: vi.fn(),
    },
    onView: vi.fn(),
    onEdit: vi.fn(),
    ...handlers,
  }

  renderWithTheme(<OrdersTable {...props} />)

  return props
}

describe('OrdersTable', () => {
  // Criterio de finalización de la card: las siete columnas, en este orden.
  it('renders the seven columns of the design, in order', () => {
    renderTable([order()])

    const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent)

    expect(headers).toEqual([
      'ID de orden',
      'Fecha y hora',
      'Destino',
      'Estado',
      'Operador logístico',
      'Total',
      'Acciones',
    ])
  })

  it('shows the external id of the sale, prefixed', () => {
    renderTable([order()])

    expect(screen.getByRole('button', { name: '#ORD-8829-X' })).toBeInTheDocument()
  })

  it('shows the address with the postal code underneath', () => {
    renderTable([order()])

    expect(screen.getByText('Av. Rivadavia 1234')).toBeInTheDocument()
    expect(screen.getByText('1406')).toBeInTheDocument()
  })

  it('shows the status translated', () => {
    renderTable([order({ status: 'cancelled' })])

    expect(screen.getByText('Cancelada')).toBeInTheDocument()
  })

  it('shows the carrier with its initials', () => {
    renderTable([order()])

    expect(screen.getByText('Correo Argentino')).toBeInTheDocument()
    expect(screen.getByText('CA')).toBeInTheDocument()
  })

  it('shows the total as money', () => {
    renderTable([order()])

    expect(screen.getByText(/1\.478\.300,00/)).toBeInTheDocument()
  })

  describe('when the order has no data behind a column', () => {
    it('falls back to the internal id without an external one', () => {
      renderTable([order({ externalOrderId: null })])

      expect(screen.getByRole('button', { name: '#8829' })).toBeInTheDocument()
    })

    it('says the carrier is not assigned yet', () => {
      renderTable([order({ carrier: null })])

      expect(screen.getByText('Sin asignar')).toBeInTheDocument()
    })

    it('marks the missing destination instead of leaving a blank cell', () => {
      renderTable([order({ customerAddress: null, customerZipCode: null })])

      expect(screen.getByText('Sin destino')).toBeInTheDocument()
    })

    it('marks the missing total', () => {
      renderTable([order({ totalAmount: null })])

      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  // Los otros dos criterios: el id y "Ver" abren el detalle, "Editar" abre la
  // edición. Las tres navegaciones salen de esta tabla.
  describe('navigation', () => {
    it('opens the detail from the order id', () => {
      const row = order()
      const { onView } = renderTable([row])

      fireEvent.click(screen.getByRole('button', { name: '#ORD-8829-X' }))

      expect(onView).toHaveBeenCalledWith(row)
    })

    it('opens the detail from the actions menu', () => {
      const row = order()
      const { onView } = renderTable([row])

      fireEvent.click(screen.getByRole('button', { name: 'Acciones de la orden #ORD-8829-X' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Ver' }))

      expect(onView).toHaveBeenCalledWith(row)
    })

    it('opens the edit screen from the actions menu', () => {
      const row = order()
      const { onEdit } = renderTable([row])

      fireEvent.click(screen.getByRole('button', { name: 'Acciones de la orden #ORD-8829-X' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Editar' }))

      expect(onEdit).toHaveBeenCalledWith(row)
    })
  })

  it('shows the empty message instead of an empty table body', () => {
    renderTable([])

    expect(screen.getByText('No hay órdenes que coincidan con el filtro.')).toBeInTheDocument()
  })
})
