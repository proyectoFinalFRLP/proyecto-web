import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useOrderDraftStore } from 'shared/store'
import type { OrderDraftItem } from 'shared/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useOriginWarehouses } from '../hooks/useOriginWarehouses'
import { useProductStocks } from '../hooks/useProductStocks'
import { useProvinces } from '../hooks/useProvinces'
import type { OriginWarehouse, ProductStockByWarehouse } from '../types'

import { ShippingStepPage } from './ShippingStepPage'

vi.mock('../hooks/useOriginWarehouses', () => ({ useOriginWarehouses: vi.fn() }))
vi.mock('../hooks/useProductStocks', () => ({ useProductStocks: vi.fn() }))
vi.mock('../hooks/useProvinces', () => ({ useProvinces: vi.fn() }))

const WAREHOUSES: OriginWarehouse[] = [
  { id: 1, name: 'CD Ezeiza', address: 'Autopista Riccheri km 22,5', zipCode: '1804' },
  { id: 2, name: 'CD Córdoba', address: 'Av. Circunvalación 3200', zipCode: '5000' },
]

const ITEMS: OrderDraftItem[] = [
  {
    productId: 12,
    sku: 'PX-9021-LRG',
    name: 'Router industrial de alta densidad',
    category: 'Electronics',
    weight: 1.2,
    unitPrice: 120000,
    quantity: 4,
  },
]

// Ezeiza cubre el borrador; Córdoba tiene 1 de las 4 unidades.
const STOCKS: ProductStockByWarehouse[] = [{ productId: 12, quantities: { 1: 40, 2: 1 } }]

function mockData({
  warehouses = WAREHOUSES,
  stocks = STOCKS,
}: { warehouses?: OriginWarehouse[]; stocks?: ProductStockByWarehouse[] } = {}) {
  vi.mocked(useOriginWarehouses).mockReturnValue({
    data: warehouses,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as never)
  vi.mocked(useProductStocks).mockReturnValue({
    stocks,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })
  vi.mocked(useProvinces).mockReturnValue({
    data: ['Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Córdoba'],
    isPending: false,
    isError: false,
  } as never)
}

function renderPage() {
  return renderWithTheme(
    <MemoryRouter initialEntries={['/orders/new/shipping']}>
      <Routes>
        <Route path="/orders/new/shipping" element={<ShippingStepPage />} />
        <Route path="/orders/new/carrier" element={<h1>Paso 3</h1>} />
        <Route path="/orders/new" element={<h1>Paso 1</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

const nextButton = () => screen.getByRole('button', { name: /Siguiente/ })
const textbox = (name: string) => screen.getByRole('textbox', { name })
const option = (name: RegExp) => screen.getByRole('radio', { name })

function type(field: HTMLElement, value: string) {
  fireEvent.change(field, { target: { value } })
}

async function pickProvince(name: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Provincia' }))
  fireEvent.click(await screen.findByRole('option', { name }))
}

async function fillDestination(zipCode = '1193') {
  type(textbox('Calle y número'), 'Av. Corrientes 3247, piso 5')
  type(textbox('Ciudad'), 'CABA')
  await pickProvince('Ciudad Autónoma de Buenos Aires')
  type(textbox('Código postal'), zipCode)
}

beforeEach(() => {
  sessionStorage.clear()
  useOrderDraftStore.getState().clearDraft()
  useOrderDraftStore
    .getState()
    .setCustomer({ firstName: 'Marina', lastName: 'Rodríguez', document: '20-31298744-9' })
  ITEMS.forEach((item) => useOrderDraftStore.getState().addItem(item))
  mockData()
})

describe('ShippingStepPage', () => {
  it('marks step 2 as the active one', () => {
    renderPage()

    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
  })

  // El listado viene acotado a la empresa desde el backend: la pantalla ofrece
  // exactamente lo que devuelve, ni uno más.
  it('offers exactly the warehouses the company has', () => {
    renderPage()

    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(option(/CD Ezeiza/)).toBeInTheDocument()
    expect(option(/CD Córdoba/)).toBeInTheDocument()
  })

  it('shows the stock level of each warehouse for the draft', () => {
    renderPage()

    expect(within(option(/CD Ezeiza/)).getByText('Stock suficiente')).toBeInTheDocument()
    expect(within(option(/CD Córdoba/)).getByText('Sin stock para la orden')).toBeInTheDocument()
  })

  it('does not let the operator pick a warehouse that cannot ship the whole order', () => {
    renderPage()

    expect(option(/CD Córdoba/)).toBeDisabled()
    expect(option(/CD Córdoba/)).toHaveAccessibleDescription(/No alcanza el stock de PX-9021-LRG/)
  })

  it('warns when no warehouse can ship the order', () => {
    mockData({ stocks: [{ productId: 12, quantities: { 1: 1 } }] })
    renderPage()

    expect(screen.getByText(/Ningún depósito tiene stock para toda la orden/)).toBeInTheDocument()
  })

  it('marks the chosen warehouse and keeps it in the draft', () => {
    renderPage()

    fireEvent.click(option(/CD Ezeiza/))

    expect(option(/CD Ezeiza/)).toHaveAttribute('aria-checked', 'true')
    expect(useOrderDraftStore.getState().origin).toEqual({ warehouseId: 1, name: 'CD Ezeiza' })
  })

  it('keeps Next disabled until a warehouse is chosen', async () => {
    renderPage()
    await fillDestination()

    await waitFor(() => expect(nextButton()).toBeDisabled())
    fireEvent.click(option(/CD Ezeiza/))
    await waitFor(() => expect(nextButton()).toBeEnabled())
  })

  it('requires the zip code', async () => {
    renderPage()
    fireEvent.click(option(/CD Ezeiza/))
    await fillDestination()
    // Tipeado y borrado: cambiar un campo vacío a vacío no dispara nada.
    type(textbox('Código postal'), '')

    expect(await screen.findByText('Ingresá el código postal.')).toBeInTheDocument()
    expect(nextButton()).toBeDisabled()
  })

  it('rejects a zip code that is not an Argentine one', async () => {
    renderPage()
    fireEvent.click(option(/CD Ezeiza/))
    await fillDestination('12')

    expect(await screen.findByText(/Usá los 4 dígitos/)).toBeInTheDocument()
    expect(nextButton()).toBeDisabled()
  })

  it('accepts the full CPA format', async () => {
    renderPage()
    fireEvent.click(option(/CD Ezeiza/))
    await fillDestination('C1193ABC')

    await waitFor(() => expect(nextButton()).toBeEnabled())
  })

  // Criterio de la card: con origen y destino definidos, «Siguiente» deja en el
  // borrador todo lo que la cotización del paso 3 necesita.
  it('stores origin and destination and moves to step 3', async () => {
    renderPage()
    fireEvent.click(option(/CD Ezeiza/))
    await fillDestination()
    await waitFor(() => expect(nextButton()).toBeEnabled())

    fireEvent.click(nextButton())

    expect(await screen.findByRole('heading', { name: 'Paso 3' })).toBeInTheDocument()
    expect(useOrderDraftStore.getState()).toMatchObject({
      origin: { warehouseId: 1, name: 'CD Ezeiza' },
      destination: {
        address: 'Av. Corrientes 3247, piso 5',
        city: 'CABA',
        province: 'Ciudad Autónoma de Buenos Aires',
        zipCode: '1193',
      },
    })
  })

  it('keeps what was typed when going back to step 1', async () => {
    renderPage()
    type(textbox('Ciudad'), 'Rosario')

    fireEvent.click(screen.getByRole('button', { name: 'Paso anterior' }))

    expect(await screen.findByRole('heading', { name: 'Paso 1' })).toBeInTheDocument()
    expect(useOrderDraftStore.getState().destination).toMatchObject({ city: 'Rosario' })
  })

  // El operador volvió al paso 1 y subió una cantidad que el depósito elegido ya
  // no cubre: no puede seguir figurando como elegido.
  it('drops a stored warehouse that no longer covers the draft', () => {
    useOrderDraftStore.getState().setOrigin({ warehouseId: 2, name: 'CD Córdoba' })
    renderPage()

    expect(option(/CD Córdoba/)).toHaveAttribute('aria-checked', 'false')
  })

  it('sends back to step 1 when there is no draft to ship', async () => {
    useOrderDraftStore.getState().clearDraft()
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Paso 1' })).toBeInTheDocument()
  })
})
