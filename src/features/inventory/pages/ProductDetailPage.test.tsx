import { fireEvent, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type * as inventoryHooks from '../hooks/useInventory'
import { useProduct, useUpdateProduct, useWarehouses } from '../hooks/useInventory'
import type { Product } from '../types'

import { ProductDetailPage } from './ProductDetailPage'

vi.mock('../hooks/useInventory', async (importOriginal) => ({
  ...(await importOriginal<typeof inventoryHooks>()),
  useProduct: vi.fn(),
  useWarehouses: vi.fn(),
  useUpdateProduct: vi.fn(),
}))

const PRODUCT: Product = {
  id: 7,
  sku: 'NOR-007',
  name: 'Cable UTP Cat6 100m',
  description: null,
  weight: 4.5,
  dimensions: null,
  stocks: [],
  updatedAt: '2026-09-01T10:00:00Z',
  version: 'W/"1"',
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
})
