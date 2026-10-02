import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { OrderDetailHeader } from './OrderDetailHeader'

function renderHeader(onModify = vi.fn(), onPrint = vi.fn()) {
  renderWithTheme(
    <MemoryRouter>
      <OrderDetailHeader
        orderLabel="#ORD-8829-X"
        statusLabel="En tránsito"
        statusVariant="info"
        ordersPath="/orders"
        onModify={onModify}
        onPrint={onPrint}
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

  // El remito se arma en el cliente (DeliveryNote): imprimir ya no espera un
  // endpoint.
  it('asks to print the delivery note', () => {
    const onPrint = vi.fn()
    renderHeader(vi.fn(), onPrint)

    fireEvent.click(screen.getByRole('button', { name: 'Imprimir remito' }))

    expect(onPrint).toHaveBeenCalledTimes(1)
  })
})
