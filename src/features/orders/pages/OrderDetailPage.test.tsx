import { fireEvent, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useOrder, useOrderShipment } from '../hooks/useOrderDetail'
import type { OrderDetail, OrderShipment, Shipment } from '../types'

import { OrderDetailPage } from './OrderDetailPage'

vi.mock('../hooks/useOrderDetail', () => ({
  useOrder: vi.fn(),
  useOrderShipment: vi.fn(),
}))

const ORDER: OrderDetail = {
  id: 8829,
  externalOrderId: 'ORD-8829-X',
  customerName: 'Global Tech Solutions S.A.',
  customerDocument: '30-71234567-8',
  customerAddress: 'Av. Corrientes 3247',
  customerZipCode: 'C1193',
  customerCity: null,
  customerProvince: null,
  status: 'paid',
  version: null,
  totalAmount: 1420000,
  lines: [
    {
      id: 1,
      productId: 12,
      sku: 'PRO-8812-A',
      productName: 'Nodo sensor industrial v3',
      quantity: 8,
      unitPrice: 120000,
      warehouseId: 1,
    },
    {
      id: 2,
      productId: 13,
      sku: 'PRO-2294-K',
      productName: 'Controlador Gateway Hub',
      quantity: 2,
      unitPrice: 150000,
      warehouseId: 1,
    },
  ],
  createdAt: '2026-08-12T12:42:00Z',
}

const SHIPMENT: Shipment = {
  id: 31,
  orderId: 8829,
  status: 'in_transit',
  trackingNumber: 'AND-9920-X8829-Z',
  shippingCost: 58300,
  courier: { id: 4, serviceId: 7, name: 'Andreani' },
  events: [],
}

// Sólo los campos que la página lee de cada query.
function query<T>(state: {
  data?: T
  isPending?: boolean
  isError?: boolean
  error?: { status?: number } | null
}) {
  return {
    data: state.data,
    isPending: state.isPending ?? false,
    isError: state.isError ?? false,
    error: state.error ?? null,
    refetch: vi.fn(),
  } as never
}

function mockQueries(
  order: Parameters<typeof query<OrderDetail>>[0],
  shipment: Parameters<typeof query<OrderShipment>>[0] = {
    data: { kind: 'single', shipment: SHIPMENT },
  },
) {
  vi.mocked(useOrder).mockReturnValue(query(order))
  vi.mocked(useOrderShipment).mockReturnValue(query(shipment))
}

function renderAt(path: string) {
  renderWithTheme(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/orders/edit/:orderId" element={<p>Pantalla de edición</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(useOrder).mockReset()
  vi.mocked(useOrderShipment).mockReset()
})

describe('OrderDetailPage', () => {
  it('does not ask the api for an id that is not a positive integer', () => {
    mockQueries({ isPending: true })

    renderAt('/orders/abc')

    expect(useOrder).toHaveBeenCalledWith(undefined)
    expect(screen.getByText('No encontramos la orden que buscabas.')).toBeInTheDocument()
  })

  it('says the order was not found when the api answers 404', () => {
    mockQueries({ isError: true, error: { status: 404 } })

    renderAt('/orders/999999')

    expect(screen.getByText('No encontramos la orden que buscabas.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a órdenes' })).toHaveAttribute(
      'href',
      '/orders',
    )
  })

  it('offers to retry any other failure', () => {
    mockQueries({ isError: true, error: { status: 500 } })

    renderAt('/orders/8829')

    expect(screen.getByText('No pudimos cargar la orden.')).toBeInTheDocument()
  })

  it('titles the page with the order and badges it with the shipment status', () => {
    mockQueries({ data: ORDER })

    renderAt('/orders/8829')

    expect(screen.getByRole('heading', { level: 1, name: 'Orden #ORD-8829-X' })).toBeInTheDocument()
    expect(screen.getAllByText('En tránsito').length).toBeGreaterThan(0)
  })

  // Criterio de la card: «Modificar orden» lleva a la ruta de edición.
  it('takes «Modificar orden» to the edit route of the order', () => {
    mockQueries({ data: ORDER })

    renderAt('/orders/8829')
    fireEvent.click(screen.getByRole('button', { name: 'Modificar orden' }))

    expect(screen.getByText('Pantalla de edición')).toBeInTheDocument()
  })

  it('adds the quoted shipping to the products in the total', () => {
    mockQueries({ data: ORDER })

    renderAt('/orders/8829')

    const payment = screen.getByRole('region', { name: 'Resumen de pago' })
    // Criterio de la card: el envío del resumen es el `shipping_cost` del Shipment.
    expect(within(payment).getByText(/58\.300,00/)).toBeInTheDocument()
    expect(within(payment).getByText(/1\.478\.300,00/)).toBeInTheDocument()
  })

  it('shows the courier, the units and the lines in the metrics', () => {
    mockQueries({ data: ORDER })

    renderAt('/orders/8829')

    expect(screen.getByText('Andreani')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('2 líneas')).toBeInTheDocument()
  })

  it('shows the customer data the order records', () => {
    mockQueries({ data: ORDER })

    renderAt('/orders/8829')

    const customer = screen.getByRole('region', { name: 'Datos del cliente' })
    expect(within(customer).getByText('Global Tech Solutions S.A.')).toBeInTheDocument()
    expect(within(customer).getByText('Av. Corrientes 3247 · CP C1193')).toBeInTheDocument()
  })

  // Si el envío no se puede leer, la orden se muestra igual.
  it('still shows the order when its shipment cannot be loaded', () => {
    mockQueries({ data: ORDER }, { isError: true, error: { status: 500 } })

    renderAt('/orders/8829')

    expect(screen.getByText('No pudimos cargar el envío de la orden.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'PRO-8812-A' })).toBeInTheDocument()
    expect(screen.getByText('Pendiente de despacho')).toBeInTheDocument()
  })

  it('leaves the shipping unquoted and the courier unassigned without a shipment', () => {
    mockQueries({ data: ORDER }, { data: { kind: 'none' } })

    renderAt('/orders/8829')

    expect(screen.getByText('Sin envío')).toBeInTheDocument()
    expect(screen.getByText('Sin asignar')).toBeInTheDocument()
    expect(screen.getByText('Sin cotizar')).toBeInTheDocument()
  })
})
