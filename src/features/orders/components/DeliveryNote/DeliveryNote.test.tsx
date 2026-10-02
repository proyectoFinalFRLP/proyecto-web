import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { OrderDetail, Shipment } from '../../types'

import { DeliveryNote } from './DeliveryNote'

const ORDER: OrderDetail = {
  id: 8829,
  externalOrderId: 'ORD-8829-X',
  customerName: 'Global Tech Solutions S.A.',
  customerDocument: '30-71234567-8',
  customerAddress: 'Av. Corrientes 3247',
  customerZipCode: 'C1193',
  customerCity: 'CABA',
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
  trackingNumber: 'AND-9920',
  shippingCost: 58300,
  courier: { id: 4, serviceId: 7, name: 'Andreani' },
  events: [],
}

const onPrinted = vi.fn()

beforeEach(() => {
  onPrinted.mockReset()
  vi.spyOn(window, 'print').mockImplementation(() => undefined)
})

function renderNote(shipment: Shipment | null = SHIPMENT) {
  renderWithTheme(
    <DeliveryNote
      order={ORDER}
      orderLabel="#ORD-8829-X"
      companyName="Distribuidora Norte"
      shipment={shipment}
      onPrinted={onPrinted}
    />,
  )
  return within(screen.getByTestId('delivery-note'))
}

describe('DeliveryNote', () => {
  it('names the company, the order and says it is not an invoice', () => {
    const note = renderNote()

    expect(note.getByText('Distribuidora Norte')).toBeInTheDocument()
    expect(note.getByText('Orden #ORD-8829-X')).toBeInTheDocument()
    expect(note.getByText('Documento no válido como factura')).toBeInTheDocument()
  })

  it('addresses it to the customer with the parts of the address it has', () => {
    const note = renderNote()

    expect(note.getByText('Global Tech Solutions S.A.')).toBeInTheDocument()
    expect(note.getByText('Av. Corrientes 3247, C1193, CABA')).toBeInTheDocument()
  })

  it('lists every line with its quantity and the total of units', () => {
    const note = renderNote()

    expect(note.getByText('Nodo sensor industrial v3')).toBeInTheDocument()
    expect(note.getByText('Total de unidades').closest('tr')).toHaveTextContent('10')
  })

  // Un remito no factura: mostrar precios lo confundiría con una factura.
  it('carries no prices', () => {
    const note = renderNote()

    expect(note.queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('names the courier and the tracking number once dispatched', () => {
    const note = renderNote()

    expect(note.getByText('Andreani')).toBeInTheDocument()
    expect(note.getByText('Seguimiento: AND-9920')).toBeInTheDocument()
  })

  it('says so when the order has no shipment yet', () => {
    const note = renderNote(null)

    expect(note.getByText('Sin operador asignado')).toBeInTheDocument()
    expect(note.getByText('Sin número de seguimiento')).toBeInTheDocument()
  })

  it('leaves room for the signature of who receives it', () => {
    const note = renderNote()

    expect(note.getByText('Aclaración')).toBeInTheDocument()
  })

  it('opens the print dialog as soon as it is mounted', () => {
    renderNote()

    expect(window.print).toHaveBeenCalledTimes(1)
  })

  // Desmontarlo antes de que el diálogo cierre imprimiría la página vacía.
  it('says it was printed only when the dialog closes', () => {
    renderNote()
    expect(onPrinted).not.toHaveBeenCalled()

    fireEvent(window, new Event('afterprint'))

    expect(onPrinted).toHaveBeenCalledTimes(1)
  })
})
