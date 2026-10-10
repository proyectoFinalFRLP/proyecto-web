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

// Los dos cubren: desde TESIS-173 es el único caso en el que la pantalla espera
// a que el operador elija, porque con uno solo lo trae elegido.
const BOTH_COVER: ProductStockByWarehouse[] = [{ productId: 12, quantities: { 1: 40, 2: 40 } }]

function mockData({
  warehouses = WAREHOUSES,
  stocks = STOCKS,
  stocksPending = false,
}: {
  warehouses?: OriginWarehouse[]
  stocks?: ProductStockByWarehouse[]
  stocksPending?: boolean
} = {}) {
  vi.mocked(useOriginWarehouses).mockReturnValue({
    data: warehouses,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as never)
  vi.mocked(useProductStocks).mockReturnValue({
    stocks: stocksPending ? [] : stocks,
    isPending: stocksPending,
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

    // Acotado al grupo de depósitos: desde TESIS-162 la pantalla tiene otro
    // grupo de radios, el de envío contra retiro en el local.
    const origins = screen.getByRole('radiogroup', { name: 'Depósito de origen de la orden' })
    expect(within(origins).getAllByRole('radio')).toHaveLength(2)
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
    mockData({ stocks: BOTH_COVER })
    renderPage()

    fireEvent.click(option(/CD Ezeiza/))

    expect(option(/CD Ezeiza/)).toHaveAttribute('aria-checked', 'true')
    expect(useOrderDraftStore.getState().origin).toEqual({ warehouseId: 1, name: 'CD Ezeiza' })
  })

  it('keeps Next disabled until a warehouse is chosen', async () => {
    mockData({ stocks: BOTH_COVER })
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

  // Dejar de resaltarlo no alcanza: el paso 3 lee el depósito del borrador, y
  // con uno que ya no cubre armaría un alta que el backend rechaza con 422.
  //
  // Ninguno cubre a propósito: si quedara uno solo, la pantalla lo elegiría en
  // su lugar (TESIS-173) y el ejemplo no distinguiría «lo borró» de «lo pisó».
  it('erases it from the draft, not only from the screen', async () => {
    mockData({ stocks: [{ productId: 12, quantities: { 1: 1, 2: 1 } }] })
    useOrderDraftStore.getState().setOrigin({ warehouseId: 2, name: 'CD Córdoba' })
    renderPage()

    await waitFor(() => expect(useOrderDraftStore.getState().origin).toBeNull())
  })

  it('replaces it with the only warehouse that still covers the draft', async () => {
    useOrderDraftStore.getState().setOrigin({ warehouseId: 2, name: 'CD Córdoba' })
    renderPage()

    await waitFor(() =>
      expect(useOrderDraftStore.getState().origin).toEqual({ warehouseId: 1, name: 'CD Ezeiza' }),
    )
  })

  // Y el que sí cubre no se toca: el borrador tiene que sobrevivir a volver y
  // entrar de nuevo al paso.
  it('keeps a stored warehouse that still covers the draft', () => {
    useOrderDraftStore.getState().setOrigin({ warehouseId: 1, name: 'CD Ezeiza' })
    renderPage()

    expect(useOrderDraftStore.getState().origin).toEqual({ warehouseId: 1, name: 'CD Ezeiza' })
  })

  it('sends back to step 1 when there is no draft to ship', async () => {
    useOrderDraftStore.getState().clearDraft()
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Paso 1' })).toBeInTheDocument()
  })
})

// TESIS-162: con retiro en el local el destino deja de pedirse. El comentario
// del código lo decía y el formulario lo seguía exigiendo igual.
describe('ShippingStepPage · pickup at the store', () => {
  function choosePickup() {
    fireEvent.click(screen.getByRole('radio', { name: /Retiro en el local/ }))
  }

  it('lets the step advance without a delivery address', async () => {
    renderPage()
    fireEvent.click(option(/CD Ezeiza/))
    choosePickup()

    await waitFor(() => expect(nextButton()).toBeEnabled())
  })

  it('says the address is optional instead of demanding it', () => {
    renderPage()
    choosePickup()

    expect(screen.getByText(/Domicilio del cliente \(opcional\)/)).toBeInTheDocument()
  })

  // Se guarda lo que haya: el paso 3 pide un destino para no mandar de vuelta
  // al 2, y el domicilio del cliente puede hacer falta para la factura.
  it('still carries whatever address was typed into the draft', async () => {
    renderPage()
    fireEvent.click(option(/CD Ezeiza/))
    await fillDestination()
    choosePickup()

    fireEvent.click(nextButton())

    await waitFor(() =>
      expect(useOrderDraftStore.getState().destination).toMatchObject({ city: 'CABA' }),
    )
  })

  // Control negativo: con envío a domicilio el destino se sigue exigiendo.
  it('keeps demanding it when the order ships', () => {
    renderPage()
    fireEvent.click(option(/CD Ezeiza/))

    expect(nextButton()).toBeDisabled()
  })
})

// TESIS-173: el depósito no venía elegido aunque hubiera uno solo posible, y
// nada decía que faltaba.
describe('ShippingStepPage · choosing the origin for the operator', () => {
  it('comes with the only warehouse that covers the order already chosen', async () => {
    renderPage()

    await waitFor(() => expect(option(/CD Ezeiza/)).toHaveAttribute('aria-checked', 'true'))
    expect(useOrderDraftStore.getState().origin).toEqual({ warehouseId: 1, name: 'CD Ezeiza' })
  })

  // Con dos posibles, de cuál sale la mercadería es una decisión del negocio.
  it('does not choose when more than one warehouse covers the order', () => {
    mockData({ stocks: BOTH_COVER })
    renderPage()

    expect(option(/CD Ezeiza/)).toHaveAttribute('aria-checked', 'false')
    expect(option(/CD Córdoba/)).toHaveAttribute('aria-checked', 'false')
    expect(useOrderDraftStore.getState().origin).toBeNull()
  })

  it('does not choose before knowing which one covers the order', () => {
    mockData({ stocksPending: true })
    renderPage()

    expect(useOrderDraftStore.getState().origin).toBeNull()
  })

  it('does not choose when none covers the order', () => {
    mockData({ stocks: [{ productId: 12, quantities: { 1: 1, 2: 1 } }] })
    renderPage()

    expect(useOrderDraftStore.getState().origin).toBeNull()
  })
})

// TESIS-173: «Siguiente» quedaba gris sin decir por qué.
describe('ShippingStepPage · what is missing to advance', () => {
  const hint = () => screen.queryByText(/^Para seguir/)

  it('marks the origin and the address fields as required when the order ships', () => {
    renderPage()

    expect(
      screen.getByRole('radiogroup', { name: 'Depósito de origen de la orden' }),
    ).toHaveAttribute('aria-required', 'true')
    expect(textbox('Calle y número')).toBeRequired()
    expect(textbox('Ciudad')).toBeRequired()
    expect(textbox('Código postal')).toBeRequired()
  })

  it('stops marking the address as required for a pickup', () => {
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Retiro en el local/ }))

    expect(textbox('Calle y número')).not.toBeRequired()
  })

  it('says the warehouse is missing while none is chosen', async () => {
    mockData({ stocks: BOTH_COVER })
    renderPage()
    await fillDestination()

    await waitFor(() =>
      expect(nextButton()).toHaveAccessibleDescription('Para seguir, falta el depósito de origen.'),
    )
  })

  // Los campos que nadie tocó también faltan: la lista no sale de los errores
  // de validación, que aparecen recién al tocar cada campo.
  it('lists every address field still missing when the order ships', () => {
    renderPage()

    expect(nextButton()).toHaveAccessibleDescription(
      'Para seguir, faltan la calle y el número, la ciudad, la provincia y un código postal válido.',
    )
  })

  it('counts a zip code in the wrong format as missing', async () => {
    renderPage()
    await fillDestination('12')

    await waitFor(() =>
      expect(nextButton()).toHaveAccessibleDescription(
        'Para seguir, falta un código postal válido.',
      ),
    )
  })

  it('does not ask for the address of a pickup', () => {
    mockData({ stocks: BOTH_COVER })
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Retiro en el local/ }))

    expect(nextButton()).toHaveAccessibleDescription('Para seguir, falta el depósito de origen.')
  })

  // Mientras viaja el stock no se puede elegir ninguno: pedirlo sería pedir
  // algo imposible, y parpadearía justo antes de que se elija solo.
  it('does not ask for the warehouse while the stock is still loading', () => {
    mockData({ stocksPending: true })
    renderPage()

    expect(hint()).not.toHaveTextContent(/depósito/)
  })

  it('says nothing once the step can advance', async () => {
    renderPage()
    await fillDestination()

    await waitFor(() => expect(nextButton()).toBeEnabled())
    expect(hint()).not.toBeInTheDocument()
  })

  it('names the confirmation as the next stage of a pickup', () => {
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Retiro en el local/ }))

    expect(screen.getByRole('button', { name: 'Siguiente: confirmación' })).toBeInTheDocument()
  })

  it('names the quotes as the next stage when the order ships', () => {
    renderPage()

    expect(screen.getByRole('button', { name: 'Siguiente: cotizaciones' })).toBeInTheDocument()
  })
})
