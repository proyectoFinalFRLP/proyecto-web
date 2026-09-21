import { screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useInfraHealth } from '../hooks/useInfraHealth'
import { useInventoryAlerts } from '../hooks/useInventoryAlerts'
import { useLogisticsKpis } from '../hooks/useLogisticsKpis'
import { useRecentOrders } from '../hooks/useRecentOrders'
import type { RecentOrder } from '../types'

import { DashboardPage } from './DashboardPage'

vi.mock('../hooks/useLogisticsKpis', () => ({ useLogisticsKpis: vi.fn() }))
vi.mock('../hooks/useInfraHealth', () => ({ useInfraHealth: vi.fn() }))
vi.mock('../hooks/useInventoryAlerts', () => ({ useInventoryAlerts: vi.fn() }))
vi.mock('../hooks/useRecentOrders', () => ({ useRecentOrders: vi.fn() }))

const ORDERS: RecentOrder[] = [
  {
    id: 8829,
    externalOrderId: 'ORD-8829-X',
    customerAddress: 'Av. Rivadavia 1234',
    customerZipCode: 'C1033',
    status: 'paid',
    totalAmount: 1478300.49,
    createdAt: '2026-08-24T14:20:00-03:00',
  },
  {
    id: 8826,
    externalOrderId: null,
    customerAddress: null,
    customerZipCode: null,
    status: 'cancelled',
    totalAmount: null,
    createdAt: '2026-08-23T09:30:00-03:00',
  },
]

function mockOrders(overrides: Partial<ReturnType<typeof useRecentOrders>> = {}) {
  vi.mocked(useRecentOrders).mockReturnValue({
    orders: ORDERS,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  })
}

const WAREHOUSES = [
  { id: 1, name: 'CD Norte', storedUnits: 200, share: 100 },
  { id: 2, name: 'CD Sur', storedUnits: 50, share: 25 },
]

function mockInventory(overrides: Partial<ReturnType<typeof useInventoryAlerts>> = {}) {
  vi.mocked(useInventoryAlerts).mockReturnValue({
    alerts: { value: 24, isLoading: false, isError: false },
    warehouses: WAREHOUSES,
    storedUnits: 250,
    warehousesLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  })
}

const alertCard = () => screen.getByRole('link', { name: 'Ver los productos con stock bajo' })

function renderPage() {
  return renderWithTheme(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<h1>Inventario</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(useLogisticsKpis).mockReturnValue({
    pendingOrders: { value: 12, isLoading: false, isError: false },
    activeShipments: { value: 5, isLoading: false, isError: false },
    isError: false,
    refetch: vi.fn(),
  })
  vi.mocked(useInfraHealth).mockReturnValue({
    nodes: [],
    reportingNodes: 0,
    onlineNodes: 0,
    healthPercentage: null,
    healthTone: 'neutral',
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as never)
  mockInventory()
  mockOrders()
})

describe('DashboardPage · inventory alerts', () => {
  it('shows how many products the backend counts below the threshold', () => {
    renderPage()

    expect(within(alertCard()).getByText('24')).toBeInTheDocument()
  })

  // Criterio de la card: la tarjeta lleva al catálogo ya filtrado, no al
  // catálogo entero. Si no, el número de la tarjeta y lo que se ve al llegar no
  // se corresponden.
  it('links to the catalog with the low stock tab already selected', () => {
    renderPage()

    expect(alertCard()).toHaveAttribute('href', '/inventory?tab=low')
  })

  it('flags the card as critical while there is something to flag', () => {
    renderPage()

    expect(within(alertCard()).getByText('Crítico')).toBeInTheDocument()
  })

  // Un cero no es una alerta: el chip y el borde rojo afirmarían un problema
  // que no existe.
  it('stays calm when no product is below the threshold', () => {
    mockInventory({ alerts: { value: 0, isLoading: false, isError: false } })
    renderPage()

    expect(within(alertCard()).queryByText('Crítico')).not.toBeInTheDocument()
    expect(within(alertCard()).getByText('Sin productos por debajo del umbral')).toBeInTheDocument()
  })

  // Tampoco grita mientras el número viaja: `undefined` no es cero.
  it('does not flag anything while the count is still travelling', () => {
    mockInventory({ alerts: { value: undefined, isLoading: true, isError: false } })
    renderPage()

    expect(within(alertCard()).queryByText('Crítico')).not.toBeInTheDocument()
  })
})

describe('DashboardPage · warehouse load', () => {
  it('lists every warehouse with the units it holds', () => {
    renderPage()

    expect(screen.getByText('CD Norte')).toBeInTheDocument()
    expect(screen.getByText('200 u')).toBeInTheDocument()
    expect(screen.getByText('CD Sur')).toBeInTheDocument()
    expect(screen.getByText('50 u')).toBeInTheDocument()
  })

  // Lo que evita que alguien lea ocupación donde hay una comparación.
  it('says out loud what the bar is measured against', () => {
    renderPage()

    expect(
      screen.getByText(/250 unidades guardadas · la barra compara contra el depósito más cargado/),
    ).toBeInTheDocument()
  })

  it('gives each bar an accessible name with its own number', () => {
    renderPage()

    expect(screen.getByLabelText('CD Norte: 200 unidades')).toBeInTheDocument()
    expect(screen.getByLabelText('CD Sur: 50 unidades')).toBeInTheDocument()
  })

  it('says so when the company has no warehouses loaded', () => {
    mockInventory({ warehouses: [], storedUnits: 0 })
    renderPage()

    expect(screen.getByText('La empresa no tiene depósitos cargados.')).toBeInTheDocument()
  })

  it('reports a failed inventory query in the page level notice', () => {
    mockInventory({ isError: true })
    renderPage()

    expect(
      screen.getByText('No se pudieron cargar algunas métricas del panel.'),
    ).toBeInTheDocument()
  })
})

describe('DashboardPage · recent orders', () => {
  it('lists the last orders with the id the operator knows them by', () => {
    renderPage()

    expect(screen.getByRole('link', { name: '#ORD-8829-X' })).toBeInTheDocument()
  })

  // Criterio de la card: el monto se formatea como moneda.
  it('writes the total as currency', () => {
    renderPage()

    expect(screen.getByText(/1\.478\.300,49/)).toBeInTheDocument()
  })

  it('falls back to the internal id when the sale came from no channel', () => {
    renderPage()

    expect(screen.getByRole('link', { name: '#8826' })).toBeInTheDocument()
  })

  // Un hueco en blanco se lee como un error de carga; esto es un dato que no
  // existe (órdenes anteriores a TESIS-114).
  it('marks a missing total instead of leaving the cell blank', () => {
    renderPage()

    const row = screen.getByRole('row', { name: /#8826/ })

    expect(within(row).getByText('Sin destino')).toBeInTheDocument()
    expect(within(row).getByText('—')).toBeInTheDocument()
  })

  it('takes each row to the detail of its own order', () => {
    renderPage()

    expect(screen.getByRole('link', { name: '#ORD-8829-X' })).toHaveAttribute(
      'href',
      '/orders/8829',
    )
  })

  // Criterio de la card: «Ver todas» lleva a la tabla general.
  it('offers a way out to the full order list', () => {
    renderPage()

    expect(screen.getByRole('link', { name: 'Ver todas' })).toHaveAttribute('href', '/orders')
  })

  it('says it is still loading instead of claiming there are no orders', () => {
    mockOrders({ orders: [], isLoading: true })
    renderPage()

    expect(screen.getByText('Cargando las últimas órdenes…')).toBeInTheDocument()
  })

  it('says so when the company has no orders at all', () => {
    mockOrders({ orders: [], isLoading: false })
    renderPage()

    expect(screen.getByText('Todavía no hay órdenes cargadas.')).toBeInTheDocument()
  })

  it('reports a failed order query in the page level notice', () => {
    mockOrders({ isError: true })
    renderPage()

    expect(
      screen.getByText('No se pudieron cargar algunas métricas del panel.'),
    ).toBeInTheDocument()
  })
})
