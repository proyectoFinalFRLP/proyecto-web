import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type * as inventoryHooks from '../hooks/useInventory'
import { useCategories, useProduct, useUpdateProduct, useWarehouses } from '../hooks/useInventory'
import type { Product } from '../types'

import { ProductDetailPage } from './ProductDetailPage'

vi.mock('../hooks/useInventory', async (importOriginal) => ({
  ...(await importOriginal<typeof inventoryHooks>()),
  useProduct: vi.fn(),
  useWarehouses: vi.fn(),
  useCategories: vi.fn(),
  useUpdateProduct: vi.fn(),
}))

const PRODUCT: Product = {
  id: 7,
  sku: 'NOR-007',
  name: 'Cable UTP Cat6 100m',
  description: null,
  category: null,
  packaging: null,
  technicalStandard: null,
  weight: 4.5,
  dimensions: null,
  committed: 0,
  onHand: 0,
  availableToPromise: 0,
  inTransit: 0,
  stocks: [],
  totalStock: 0,
  stockStatus: 'out_of_stock',
  inTransitQuantity: 0,
  inTransitByWarehouse: [],
  committedByWarehouse: [],
  updatedAt: '2026-09-01T10:00:00Z',
  version: 'W/"1"',
}

// NOR-003 de los seeds: 100 en Central + 30 en Satélite = 130. El catálogo lo
// muestra «Disponible» (130 > 100); el detalle lo mostraba «Crítico» porque
// calculaba el badge con umbrales propios (≤ 200).
const SEEDED_MOUSE: Product = {
  ...PRODUCT,
  sku: 'NOR-003',
  name: 'Mouse Inalámbrico Logitech',
  category: 'Electronics',
  stocks: [
    {
      warehouseId: 1,
      quantity: 100,
      committed: 0,
      warehouse: { id: 1, name: 'Depósito Central', address: 'Av. 7 N° 1234', capacity: null },
      stockStatus: 'low',
    },
    {
      warehouseId: 2,
      quantity: 30,
      committed: 0,
      warehouse: {
        id: 2,
        name: 'Depósito Satélite Norte',
        address: 'Calle 25 N° 456',
        capacity: null,
      },
      stockStatus: 'low',
    },
  ],
  totalStock: 130,
  stockStatus: 'available',
  inTransitQuantity: 12,
  inTransitByWarehouse: [
    { warehouseId: 2, name: 'Depósito Satélite Norte', quantity: 5 },
    { warehouseId: 3, name: 'Depósito Sur', quantity: 7 },
  ],
}

function showProduct(product: Product) {
  vi.mocked(useProduct).mockReturnValue({
    data: product,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  } as never)
}

/** La fila de la tabla de distribución que nombra a un depósito. */
function distributionRow(warehouse: string) {
  const cell = screen.getByText(warehouse)
  const row = cell.closest('tr')
  if (row === null) throw new Error(`no row for ${warehouse}`)
  return within(row)
}

const editForm = () => screen.queryByText(`Editar producto: ${PRODUCT.name}`)

// Lo que quedó en `history.state`, que es donde vive `location.state`. Es lo que
// el navegador conserva en un F5, así que es lo que hay que mirar para saber si
// la intención de editar se consumió o sigue ahí esperando al próximo montaje.
function EstadoDeLaRuta() {
  const { state } = useLocation()

  return <span data-testid="estado-de-la-ruta">{JSON.stringify(state)}</span>
}

function renderDetail(state?: { edit: true }) {
  return renderWithTheme(
    <MemoryRouter initialEntries={[{ pathname: '/inventory/7', state }]}>
      <EstadoDeLaRuta />
      <Routes>
        <Route path="/inventory/:productId" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(useProduct).mockReturnValue({
    data: PRODUCT,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  } as never)
  vi.mocked(useCategories).mockReturnValue({ data: ['Electronics', 'Power'] } as never)
  vi.mocked(useWarehouses).mockReturnValue({
    data: [],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as never)
  vi.mocked(useUpdateProduct).mockReturnValue({
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null,
  } as never)
})

describe('ProductDetailPage', () => {
  // Es la única diferencia entre «Ver» y «Editar» del menú de acciones del
  // catálogo: las dos opciones llevan a esta misma ruta (TESIS-62).
  it('opens the edit form when it is reached with the intent of editing', async () => {
    renderDetail({ edit: true })

    expect(await screen.findByText(`Editar producto: ${PRODUCT.name}`)).toBeInTheDocument()
  })

  it('shows only the record when it is reached without that intent', () => {
    renderDetail()

    expect(editForm()).not.toBeInTheDocument()
  })

  // `location.state` vive en `history.state`, que sobrevive a un reload y a ir
  // y volver. Si no se borra, el formulario se reabre solo en el próximo
  // montaje aunque la persona lo haya cerrado.
  it('consumes the intent so it does not survive a reload', async () => {
    renderDetail({ edit: true })

    await waitFor(() => expect(screen.getByTestId('estado-de-la-ruta')).toHaveTextContent('null'))
  })

  it('keeps the form closed once it is dismissed', async () => {
    renderDetail({ edit: true })
    await screen.findByText(`Editar producto: ${PRODUCT.name}`)

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    await waitFor(() => expect(editForm()).not.toBeInTheDocument())
  })

  describe('the data that comes from the backend', () => {
    it('shows the badge the catalog shows for the same product', () => {
      showProduct(SEEDED_MOUSE)
      renderDetail()

      expect(screen.getAllByText('Disponible').length).toBeGreaterThan(0)
      expect(screen.queryByText('Crítico')).not.toBeInTheDocument()
    })

    it('shows the status the backend sent for each warehouse', () => {
      showProduct(SEEDED_MOUSE)
      renderDetail()

      expect(distributionRow('Depósito Central').getByText('Stock bajo')).toBeInTheDocument()
      expect(distributionRow('Depósito Satélite Norte').getByText('Stock bajo')).toBeInTheDocument()
    })

    it('shows the category of the product', () => {
      showProduct(SEEDED_MOUSE)
      renderDetail()

      expect(screen.getByText('Electronics')).toBeInTheDocument()
    })

    it('shows the no-data mark for a product with no category', () => {
      renderDetail()

      expect(screen.getByText('Categoría').parentElement).toHaveTextContent('—')
    })

    it('takes the master total from the API instead of adding the rows', () => {
      showProduct({ ...SEEDED_MOUSE, totalStock: 131 })
      renderDetail()

      expect(screen.getByText('131')).toBeInTheDocument()
    })

    // El en tránsito queda fuera del total: 130 sigue siendo 130.
    it('shows the units in flight apart from the total', () => {
      showProduct(SEEDED_MOUSE)
      renderDetail()

      expect(
        screen.getByText('En tránsito', { selector: 'p, span' }).parentElement?.parentElement,
      ).toHaveTextContent('12')
      expect(screen.getByText('130')).toBeInTheDocument()
    })

    it('puts the incoming units on the row of their destination', () => {
      showProduct(SEEDED_MOUSE)
      renderDetail()

      expect(distributionRow('Depósito Satélite Norte').getByText('5')).toBeInTheDocument()
    })

    // Depósito Sur no tiene fila en `stocks`: la nace al recibir la transferencia.
    it('lists a warehouse that only waits for units in flight', () => {
      showProduct(SEEDED_MOUSE)
      renderDetail()

      expect(distributionRow('Depósito Sur').getByText('7')).toBeInTheDocument()
      expect(distributionRow('Depósito Sur').getByText('Sin stock')).toBeInTheDocument()
    })
  })
})
