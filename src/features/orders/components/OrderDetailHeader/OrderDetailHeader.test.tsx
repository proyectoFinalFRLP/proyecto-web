import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { OrderDetailHeader } from './OrderDetailHeader'

function renderHeader(onModify = vi.fn()) {
  renderWithTheme(
    <MemoryRouter>
      <OrderDetailHeader
        orderLabel="#ORD-8829-X"
        statusLabel="En tránsito"
        statusVariant="info"
        ordersPath="/orders"
        onModify={onModify}
      />
    </MemoryRouter>,
  )

  return onModify
}

describe('OrderDetailHeader', () => {
  it('titles the page with the order id and shows its status', () => {
    renderHeader()

    expect(screen.getByRole('heading', { level: 1, name: 'Orden #ORD-8829-X' })).toBeInTheDocument()
    expect(screen.getByText('En tránsito')).toBeInTheDocument()
  })

  it('links the breadcrumb back to the orders list', () => {
    renderHeader()

    expect(screen.getByRole('link', { name: 'Órdenes' })).toHaveAttribute('href', '/orders')
  })

  it('asks to modify the order', () => {
    const onModify = renderHeader()

    fireEvent.click(screen.getByRole('button', { name: 'Modificar orden' }))

    expect(onModify).toHaveBeenCalledTimes(1)
  })

  // Sin endpoint de remito, un botón activo prometería algo que no pasa.
  it('keeps the print action visible but disabled', () => {
    renderHeader()

    expect(screen.getByRole('button', { name: 'Imprimir remito' })).toBeDisabled()
  })
})
