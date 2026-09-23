import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useOrderDraftStore } from 'shared/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import type { CatalogProduct } from '../types'

import { NewOrderPage } from './NewOrderPage'

vi.mock('../hooks/useCatalogProducts', () => ({ useCatalogProducts: vi.fn() }))

const CATALOG: CatalogProduct[] = [
  {
    id: 12,
    sku: 'PX-9021-LRG',
    name: 'Router industrial de alta densidad',
    category: 'Electronics',
    weight: 1.2,
    totalStock: 40,
  },
  {
    id: 13,
    sku: 'PX-1185-MED',
    name: 'Sensor de presión X4',
    category: 'Machinery',
    weight: 0.4,
    totalStock: 120,
  },
]

function mockCatalog(state: {
  data?: CatalogProduct[]
  isPending?: boolean
  isFetching?: boolean
  isError?: boolean
}) {
  vi.mocked(useCatalogProducts).mockReturnValue({
    data: state.data,
    isPending: state.isPending ?? false,
    isFetching: state.isFetching ?? false,
    isError: state.isError ?? false,
    refetch: vi.fn(),
  } as never)
}

/** Con qué término se pidió el catálogo la última vez. */
function lastSearch(): string {
  const calls = vi.mocked(useCatalogProducts).mock.calls

  return calls[calls.length - 1][0]
}

function renderPage() {
  return renderWithTheme(
    <MemoryRouter initialEntries={['/orders/new']}>
      <Routes>
        <Route path="/orders/new" element={<NewOrderPage />} />
        <Route path="/orders/new/shipping" element={<h1>Paso 2</h1>} />
        <Route path="/orders" element={<h1>Listado</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

const nextButton = () => screen.getByRole('button', { name: /Siguiente/ })

// `getByRole` y no `getByLabelText`: el `<label>` que envuelve a cada campo
// arrastra en su `textContent` el espacio de ancho cero del outline de MUI,
// que el nombre accesible (calculado por rol) sí descarta.
const textbox = (name: string) => screen.getByRole('textbox', { name })
const spinbutton = (name: string) => screen.getByRole('spinbutton', { name })
const search = () => screen.getByRole('combobox', { name: 'Buscar por SKU o nombre' })

function type(field: HTMLElement, value: string) {
  // El Autocomplete descarta lo tipeado si el input no tiene foco, y
  // `fireEvent.change` no lo enfoca solo, como sí lo haría un click.
  fireEvent.focus(field)
  fireEvent.change(field, { target: { value } })
}

function fillCustomer() {
  type(textbox('Nombre'), 'Marina')
  type(textbox('Apellido'), 'Rodríguez')
  type(textbox('DNI / CUIT'), '20-31298744-9')
}

async function pickProduct(term: string) {
  type(search(), term)
  fireEvent.click(await screen.findByRole('option', { name: new RegExp(term, 'i') }))
}

async function addProduct(term: string, quantity: string, price: string) {
  await pickProduct(term)
  type(spinbutton('Cantidad'), quantity)
  type(spinbutton('Precio unitario'), price)
  fireEvent.click(screen.getByRole('button', { name: 'Agregar SKU' }))
}

beforeEach(() => {
  useOrderDraftStore.getState().clearDraft()
  mockCatalog({ data: CATALOG })
})

describe('NewOrderPage', () => {
  it('starts with the next step locked', () => {
    renderPage()

    expect(nextButton()).toBeDisabled()
  })

  // Criterio de la card: cliente completo Y al menos un producto. Cada uno
  // por separado no alcanza.
  it('keeps the next step locked with the customer but no products', async () => {
    renderPage()

    fillCustomer()

    expect(nextButton()).toBeDisabled()
  })

  it('keeps the next step locked with products but no customer', async () => {
    renderPage()

    await addProduct('PX-9021', '12', '120000')

    expect(screen.getByRole('row', { name: /PX-9021-LRG/ })).toBeInTheDocument()
    expect(nextButton()).toBeDisabled()
  })

  it('unlocks the next step with the customer and one product', async () => {
    renderPage()

    fillCustomer()
    await addProduct('PX-9021', '12', '120000')

    await waitFor(() => expect(nextButton()).toBeEnabled())
  })

  // El filtro es del backend (TESIS-125): lo que la pantalla tiene que hacer es
  // mandarle lo tipeado. Buscar en memoria dejaba fuera del buscador todo
  // producto más allá del corte de la API, sin que se distinguiera de «no
  // existe».
  it('asks the backend for what was typed', async () => {
    renderPage()

    type(search(), 'sensor')

    await waitFor(() => expect(lastSearch()).toBe('sensor'))
  })

  it('does not go to the backend on every keystroke', async () => {
    renderPage()

    type(search(), 's')
    type(search(), 'se')
    type(search(), 'sen')

    // Las tres pulsaciones colapsan en una sola búsqueda.
    await waitFor(() => expect(lastSearch()).toBe('sen'))
    expect(
      vi.mocked(useCatalogProducts).mock.calls.filter((call) => call[0] === 'se'),
    ).toHaveLength(0)
  })

  // Lo que llega ya viene filtrado: la pantalla no vuelve a decidir qué mostrar.
  it('lists what the backend returned without filtering it again', async () => {
    mockCatalog({ data: [CATALOG[1]] })
    renderPage()

    type(search(), 'sensor')

    expect(await screen.findByRole('option', { name: /PX-1185-MED/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /PX-9021-LRG/ })).not.toBeInTheDocument()
  })

  it('will not add a line until quantity and price are valid', async () => {
    renderPage()

    await pickProduct('PX-9021')

    // Con cantidad 1 por defecto pero sin precio, todavía no.
    expect(screen.getByRole('button', { name: 'Agregar SKU' })).toBeDisabled()

    type(spinbutton('Precio unitario'), '120000')

    expect(screen.getByRole('button', { name: 'Agregar SKU' })).toBeEnabled()
  })

  it('recalculates the subtotal and the weight as lines are added', async () => {
    renderPage()

    await addProduct('PX-9021', '12', '120000')
    await addProduct('PX-1185', '50', '3313')

    // 12 × 120.000 + 50 × 3.313 = 1.605.650 · 12 × 1,2 kg + 50 × 0,4 kg = 34,4 kg
    expect(screen.getByLabelText('Subtotal de productos')).toHaveTextContent('1.605.650,00')
    expect(screen.getByLabelText('Peso total estimado')).toHaveTextContent('34,4 kg')
  })

  it('recalculates when the quantity of a line changes in the table', async () => {
    renderPage()

    await addProduct('PX-9021', '12', '120000')

    type(spinbutton('Cantidad de PX-9021-LRG'), '2')

    expect(screen.getByLabelText('Subtotal de productos')).toHaveTextContent('240.000,00')
    expect(screen.getByLabelText('Peso total estimado')).toHaveTextContent('2,4 kg')
  })

  // Una fila a medias bloquea el paso entero, no sólo su celda.
  it('locks the next step again when a line is left without quantity', async () => {
    renderPage()

    fillCustomer()
    await addProduct('PX-9021', '12', '120000')
    await waitFor(() => expect(nextButton()).toBeEnabled())

    type(spinbutton('Cantidad de PX-9021-LRG'), '')

    expect(nextButton()).toBeDisabled()
  })

  it('removes a line from its row menu', async () => {
    renderPage()

    await addProduct('PX-9021', '12', '120000')
    fireEvent.click(screen.getByRole('button', { name: 'Acciones de PX-9021-LRG' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Quitar' }))

    expect(screen.queryByRole('row', { name: /PX-9021-LRG/ })).not.toBeInTheDocument()
    expect(useOrderDraftStore.getState().items).toEqual([])
  })

  it('keeps a product that is already listed out of reach in the search', async () => {
    renderPage()

    await addProduct('PX-9021', '12', '120000')
    type(search(), 'PX-9021')

    const option = await screen.findByRole('option', { name: /PX-9021/ })

    expect(option).toHaveAttribute('aria-disabled', 'true')
    expect(within(option).getByText('Ya está en la lista')).toBeInTheDocument()
  })

  // Criterio de la card: al avanzar, cliente y carrito quedan en el estado
  // global para el paso siguiente.
  it('saves the customer in the draft and moves to the next step', async () => {
    renderPage()

    fillCustomer()
    await addProduct('PX-9021', '12', '120000')
    await waitFor(() => expect(nextButton()).toBeEnabled())
    fireEvent.click(nextButton())

    expect(await screen.findByRole('heading', { name: 'Paso 2' })).toBeInTheDocument()
    expect(useOrderDraftStore.getState()).toMatchObject({
      customer: { firstName: 'Marina', lastName: 'Rodríguez', document: '20-31298744-9' },
      items: [{ productId: 12, quantity: 12, unitPrice: 120000 }],
    })
  })

  it('comes back from the next step with the customer already filled in', () => {
    useOrderDraftStore
      .getState()
      .setCustomer({ firstName: 'Marina', lastName: 'Rodríguez', document: '20-31298744-9' })
    renderPage()

    expect(textbox('Nombre')).toHaveValue('Marina')
  })

  it('cancelling clears the draft and returns to the list', async () => {
    renderPage()

    await addProduct('PX-9021', '12', '120000')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar orden' }))

    expect(await screen.findByRole('heading', { name: 'Listado' })).toBeInTheDocument()
    expect(useOrderDraftStore.getState().items).toEqual([])
  })

  it('offers a retry when the catalog fails, without hiding the form', () => {
    mockCatalog({ isError: true })
    renderPage()

    expect(screen.getByText('No pudimos cargar el catálogo de productos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(textbox('Nombre')).toBeInTheDocument()
  })
})
