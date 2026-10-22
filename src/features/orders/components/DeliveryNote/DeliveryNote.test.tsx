import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { OrderDetail } from '../../types'

import { DeliveryNote } from './DeliveryNote'

const ORDER: OrderDetail = {
  id: 8829,
  externalOrderId: null,
  externalOrderNumber: '#1001',
  customerName: 'Global Tech Solutions S.A.',
  customerDocument: '30-71234567-8',
  customerEmail: null,
  customerPhone: '1123423456',
  customerAddress: 'Av. Corrientes 3247',
  customerZipCode: 'C1193',
  customerCity: 'CABA',
  customerProvince: 'Ciudad Autónoma de Buenos Aires',
  status: 'paid',
  requiresShipping: true,
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
      quantity: 1200,
      unitPrice: 150000,
      warehouseId: 1,
    },
  ],
  createdAt: '2026-10-12T15:00:00Z',
}

// `null` y no `undefined` para «sin empresa»: con `undefined` entraría el default.
function renderNote(order: OrderDetail = ORDER, companyName: string | null = 'Norte S.A.') {
  return renderWithTheme(
    <DeliveryNote
      order={order}
      orderLabel="#1001"
      companyName={companyName ?? undefined}
      issuedAt="2026-10-19T15:00:00Z"
    />,
  )
}

// En pantalla el remito está escondido (`display: none` hasta `@media print`),
// y las consultas por rol saltean lo escondido: hay que pedirlo explícito.
const HIDDEN = { hidden: true }

describe('DeliveryNote', () => {
  it('names the company, the order and when it was issued', () => {
    renderNote()

    expect(screen.getByText('Norte S.A.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Remito', ...HIDDEN })).toBeInTheDocument()
    expect(screen.getByText('#1001')).toBeInTheDocument()
    // La fecha la escribe `Intl`, que según la versión de ICU dice «19 oct 2026»
    // o «19 de oct de 2026»: se afirma el día, el mes y el año.
    expect(screen.getByText(/^Emitido el 19 .*oct.* 2026$/)).toBeInTheDocument()
    expect(screen.getByText(/^Orden del 12 .*oct.* 2026$/)).toBeInTheDocument()
  })

  // Sin tenant cargado no se inventa un nombre de empresa.
  it('leaves the company out when it does not know it', () => {
    renderNote(ORDER, null)

    expect(screen.queryByText('Norte S.A.')).not.toBeInTheDocument()
  })

  it('says who receives it and where', () => {
    renderNote()

    expect(screen.getByText('Global Tech Solutions S.A.')).toBeInTheDocument()
    expect(screen.getByText('DNI / CUIT: 30-71234567-8')).toBeInTheDocument()
    expect(screen.getByText('Av. Corrientes 3247')).toBeInTheDocument()
    expect(screen.getByText('CP C1193')).toBeInTheDocument()
    expect(screen.getByText('CABA, Ciudad Autónoma de Buenos Aires')).toBeInTheDocument()
  })

  // Un retiro no tiene domicilio de entrega: no se imprime uno.
  it('prints no address for an order picked up at the store', () => {
    renderNote({ ...ORDER, requiresShipping: false })

    expect(screen.getByText('Retira en el local')).toBeInTheDocument()
    expect(screen.queryByText('Av. Corrientes 3247')).not.toBeInTheDocument()
  })

  it('lists every line with its quantity, and adds up the units', () => {
    renderNote()

    const [, first, second] = screen.getAllByRole('row', HIDDEN)
    expect(within(first).getByText('PRO-8812-A')).toBeInTheDocument()
    expect(within(first).getByText('Nodo sensor industrial v3')).toBeInTheDocument()
    expect(within(first).getByText('8')).toBeInTheDocument()
    expect(within(second).getByText('1.200')).toBeInTheDocument()
    expect(screen.getByText('1.208')).toBeInTheDocument()
  })

  // El remito dice qué se entrega, no cuánto costó.
  it('shows no prices', () => {
    renderNote()

    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  // Al imprimir es lo único que sale: el resto del `body` se esconde.
  it('hides everything else from the printed page while it is mounted', () => {
    renderNote()

    const css = [...document.head.querySelectorAll('style')]
      .map((style) => style.textContent)
      .join('')
    expect(css).toContain('body>:not([data-delivery-note])')
    expect(document.querySelector('body > [data-delivery-note]')).not.toBeNull()
  })
})
