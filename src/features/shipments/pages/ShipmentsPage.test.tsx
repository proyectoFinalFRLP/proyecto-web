import { fireEvent, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type * as shipmentHooks from '../hooks/useShipments'
import { useShipmentCounts, useShipmentPage } from '../hooks/useShipments'
import type { ShipmentPage, ShipmentSummary } from '../types'

import { ShipmentsPage } from './ShipmentsPage'

// `importOriginal` para conservar `SHIPMENT_TABS`, que la pantalla usa para
// armar las pestañas: mockear el módulo entero la dejaría sin ninguna.
vi.mock('../hooks/useShipments', async (importOriginal) => ({
  ...(await importOriginal<typeof shipmentHooks>()),
  useShipmentPage: vi.fn(),
  useShipmentCounts: vi.fn(),
}))

const DISPATCHED: ShipmentSummary = {
  id: 31,
  orderId: 8829,
  status: 'in_transit',
  trackingNumber: 'AND-9920-X8829-Z',
  shippingCost: 58300,
  courier: { id: 4, serviceId: 7, name: 'Andreani' },
  createdAt: '2026-08-24T12:14:00Z',
}

// Recién abierto: los tres datos que completa el despacho todavía no están.
const PENDING: ShipmentSummary = {
  ...DISPATCHED,
  id: 32,
  orderId: 8830,
  status: 'pending',
  trackingNumber: null,
  shippingCost: null,
  courier: null,
}

function mockPage(rows: ShipmentSummary[], overrides: Partial<ShipmentPage> = {}) {
  vi.mocked(useShipmentPage).mockReturnValue({
    data: { shipments: rows, page: 1, perPage: 20, total: rows.length, ...overrides },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as never)
}

function renderPage() {
  renderWithTheme(
    <MemoryRouter initialEntries={['/shipments']}>
      <Routes>
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/orders/:orderId" element={<p>Detalle de la orden</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(useShipmentPage).mockReset()
  vi.mocked(useShipmentCounts).mockReturnValue([2, 1, 0, 1, 0] as never)
  mockPage([DISPATCHED, PENDING])
})

describe('ShipmentsPage', () => {
  it('lists the shipments of the company', () => {
    renderPage()

    expect(screen.getByText('Envío #31')).toBeInTheDocument()
    expect(screen.getByText('AND-9920-X8829-Z')).toBeInTheDocument()
    expect(screen.getByText('Andreani')).toBeInTheDocument()
  })

  // Los tres los completa la confirmación del despacho (TESIS-47): hasta
  // entonces la celda dice por qué falta, en vez de quedar vacía.
  it('says what a shipment that was not dispatched yet is missing', () => {
    renderPage()

    expect(screen.getByText('Sin asignar')).toBeInTheDocument()
    expect(screen.getByText('Pendiente de despacho')).toBeInTheDocument()
  })

  // Un envío sin cotizar no cuesta cero: no se cotizó.
  it('does not claim a shipment without a quote is free', () => {
    renderPage()

    expect(screen.getByText('Sin cotizar')).toBeInTheDocument()
  })

  it('shows the quoted cost of the one that was dispatched', () => {
    renderPage()

    expect(screen.getByText(/58\.300/)).toBeInTheDocument()
  })

  // El detalle del envío vive en su orden: no hay pantalla propia.
  it('takes each row to the order of its shipment', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Orden #8829' }))

    expect(screen.getByText('Detalle de la orden')).toBeInTheDocument()
  })

  it('counts each tab of the lifecycle', () => {
    renderPage()

    const tabs = screen.getByRole('tablist')
    expect(within(tabs).getByRole('tab', { name: /Todos/ })).toHaveTextContent('2')
    expect(within(tabs).getByRole('tab', { name: /Pendientes/ })).toHaveTextContent('1')
  })

  // Un contador que todavía no resolvió no muestra cero: sería un número falso
  // durante el primer render.
  it('leaves a tab without a number while its count travels', () => {
    vi.mocked(useShipmentCounts).mockReturnValue([undefined, 1, 0, 1, 0] as never)
    renderPage()

    expect(
      within(screen.getByRole('tablist')).getByRole('tab', { name: /Todos/ }),
    ).not.toHaveTextContent('0')
  })

  it('says the range it is showing', () => {
    renderPage()

    expect(screen.getByText('Mostrando 1 a 2 de 2 envíos')).toBeInTheDocument()
  })

  // «Mostrando 1 a 0» es una frase rota.
  it('starts the range at zero when there is nothing to show', () => {
    mockPage([], { total: 0 })
    renderPage()

    expect(screen.getByText('Mostrando 0 a 0 de 0 envíos')).toBeInTheDocument()
  })

  it('offers to retry when the listing fails', () => {
    const refetch = vi.fn()
    vi.mocked(useShipmentPage).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    } as never)

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/ }))

    expect(refetch).toHaveBeenCalled()
  })
})
