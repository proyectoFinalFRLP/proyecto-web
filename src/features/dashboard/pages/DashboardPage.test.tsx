import { screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useInfraHealth } from '../hooks/useInfraHealth'
import { useInventoryAlerts } from '../hooks/useInventoryAlerts'
import { useLogisticsKpis } from '../hooks/useLogisticsKpis'

import { DashboardPage } from './DashboardPage'

vi.mock('../hooks/useLogisticsKpis', () => ({ useLogisticsKpis: vi.fn() }))
vi.mock('../hooks/useInfraHealth', () => ({ useInfraHealth: vi.fn() }))
vi.mock('../hooks/useInventoryAlerts', () => ({ useInventoryAlerts: vi.fn() }))

const WAREHOUSES = [
  { id: 1, name: 'CD Norte', storedUnits: 200, share: 100 },
  { id: 2, name: 'CD Sur', storedUnits: 50, share: 25 },
]

// 18 por debajo del umbral y 6 agotados: 24 en alerta. El desglose importa
// porque los agotados eran justo los que el contador dejaba afuera.
function mockInventory(overrides: Partial<ReturnType<typeof useInventoryAlerts>> = {}) {
  vi.mocked(useInventoryAlerts).mockReturnValue({
    alerts: { value: 24, isLoading: false, isError: false },
    breakdown: { low: 18, outOfStock: 6 },
    warehouses: WAREHOUSES,
    storedUnits: 250,
    warehousesLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  })
}

const alertCard = () => screen.getByRole('link', { name: /Alertas de inventario/ })

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
})

describe('DashboardPage · inventory alerts', () => {
  // El agotado también es alerta: `low` en el backend es `BETWEEN 1 AND umbral`,
  // así que contar sólo eso dejaba afuera los productos que ya no se venden.
  it('counts the products that are out of stock as well as the low ones', () => {
    renderPage()

    expect(within(alertCard()).getByText('24')).toBeInTheDocument()
  })

  it('says what the number is made of', () => {
    renderPage()

    expect(
      within(alertCard()).getByText('6 sin stock · 18 por debajo del umbral'),
    ).toBeInTheDocument()
  })

  // Con agotados, ésos son los que hay que trabajar primero: ya no se pueden
  // vender.
  it('links to the out of stock tab while there is anything out of stock', () => {
    renderPage()

    expect(alertCard()).toHaveAttribute('href', '/inventory?tab=out_of_stock')
  })

  it('links to the low stock tab when nothing is out of stock', () => {
    mockInventory({
      alerts: { value: 18, isLoading: false, isError: false },
      breakdown: { low: 18, outOfStock: 0 },
    })
    renderPage()

    expect(alertCard()).toHaveAttribute('href', '/inventory?tab=low')
  })

  it('links to the plain catalog when the inventory is healthy', () => {
    mockInventory({
      alerts: { value: 0, isLoading: false, isError: false },
      breakdown: { low: 0, outOfStock: 0 },
    })
    renderPage()

    expect(alertCard()).toHaveAttribute('href', '/inventory')
  })

  // Un `aria-label` reemplaza al contenido: si dijera sólo «ver los productos»,
  // un lector de pantalla perdería el número y el «crítico».
  it('keeps the number inside the accessible name of the link', () => {
    renderPage()

    expect(
      screen.getByRole('link', { name: /Alertas de inventario: 24, crítico/ }),
    ).toBeInTheDocument()
  })

  it('flags the card as critical while there is something to flag', () => {
    renderPage()

    expect(within(alertCard()).getByText('Crítico')).toBeInTheDocument()
  })

  // Un cero no es una alerta: el chip y el borde rojo afirmarían un problema
  // que no existe.
  it('stays calm when nothing is in alert', () => {
    mockInventory({
      alerts: { value: 0, isLoading: false, isError: false },
      breakdown: { low: 0, outOfStock: 0 },
    })
    renderPage()

    expect(within(alertCard()).queryByText('Crítico')).not.toBeInTheDocument()
    expect(within(alertCard()).getByText('Sin productos en alerta de stock')).toBeInTheDocument()
  })

  // Tampoco grita mientras el número viaja: `undefined` no es cero.
  it('does not flag anything while the count is still travelling', () => {
    mockInventory({
      alerts: { value: undefined, isLoading: true, isError: false },
      breakdown: undefined,
    })
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
