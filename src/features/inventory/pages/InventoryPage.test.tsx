import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type * as inventoryHooks from '../hooks/useInventory'
import {
  useCreateProduct,
  useDeleteProduct,
  useProductCounts,
  useProductPage,
  useWarehouses,
} from '../hooks/useInventory'

import { InventoryPage } from './InventoryPage'

vi.mock('../hooks/useInventory', async (importOriginal) => ({
  ...(await importOriginal<typeof inventoryHooks>()),
  useProductPage: vi.fn(),
  useProductCounts: vi.fn(),
  useWarehouses: vi.fn(),
  useCreateProduct: vi.fn(),
  useDeleteProduct: vi.fn(),
}))

const IDLE_MUTATION = { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null }

function renderCatalog(url: string) {
  return renderWithTheme(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/inventory" element={<InventoryPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

const tab = (name: string) => screen.getByRole('tab', { name: new RegExp(name) })

/** El `status` con el que la pantalla pidió la última página del catálogo. */
function lastRequestedStatus() {
  const calls = vi.mocked(useProductPage).mock.calls

  return calls[calls.length - 1][0].status
}

beforeEach(() => {
  vi.mocked(useProductPage).mockReturnValue({
    data: { products: [], total: 0 },
    isPending: false,
    isError: false,
  } as never)
  vi.mocked(useProductCounts).mockReturnValue([0, 0, 0, 0] as never)
  vi.mocked(useWarehouses).mockReturnValue({
    data: [],
    isPending: false,
    isError: false,
  } as never)
  vi.mocked(useCreateProduct).mockReturnValue(IDLE_MUTATION as never)
  vi.mocked(useDeleteProduct).mockReturnValue(IDLE_MUTATION as never)
})

describe('InventoryPage · the tab in the URL', () => {
  it('opens on every product when the URL asks for no tab', () => {
    renderCatalog('/inventory')

    expect(tab('Todos')).toHaveAttribute('aria-selected', 'true')
    expect(lastRequestedStatus()).toBeUndefined()
  })

  // Es el enlace que dispara la tarjeta de alertas del panel (TESIS-55): si la
  // pestaña no viniera preseleccionada, el número de la tarjeta y lo que se ve
  // al llegar no se corresponderían.
  it('opens on the low stock tab when the URL asks for it', () => {
    renderCatalog('/inventory?tab=low')

    expect(tab('Stock bajo')).toHaveAttribute('aria-selected', 'true')
    expect(lastRequestedStatus()).toBe('low')
  })

  it('falls back to every product when the URL asks for a tab that does not exist', () => {
    renderCatalog('/inventory?tab=inventada')

    expect(tab('Todos')).toHaveAttribute('aria-selected', 'true')
    expect(lastRequestedStatus()).toBeUndefined()
  })

  it('writes the chosen tab back into the URL', () => {
    renderCatalog('/inventory')

    fireEvent.click(tab('Sin stock'))

    expect(tab('Sin stock')).toHaveAttribute('aria-selected', 'true')
    expect(lastRequestedStatus()).toBe('out_of_stock')
  })

  // `all` es el estado por defecto: dejarlo escrito ensuciaría la URL con un
  // parámetro que no cambia nada.
  it('drops the parameter again when it goes back to every product', () => {
    renderCatalog('/inventory?tab=low')

    fireEvent.click(tab('Todos'))

    expect(lastRequestedStatus()).toBeUndefined()
  })
})
