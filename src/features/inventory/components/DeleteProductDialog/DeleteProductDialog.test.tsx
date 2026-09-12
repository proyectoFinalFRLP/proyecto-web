import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { ProductSummary } from '../../types'

import { DeleteProductDialog } from './DeleteProductDialog'

const PRODUCT: ProductSummary = {
  id: 5,
  sku: 'CAB-6-305',
  name: 'Cable UTP Cat6',
  category: 'Cabling',
  totalStock: 10,
  stockStatus: 'low',
  inTransitQuantity: 0,
  primaryWarehouse: { id: 1, name: 'CD Ezeiza', quantity: 10 },
  warehouseCount: 1,
}

function renderDialog(overrides: Partial<Parameters<typeof DeleteProductDialog>[0]> = {}) {
  const props = {
    product: PRODUCT,
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }

  renderWithTheme(<DeleteProductDialog {...props} />)

  return props
}

describe('DeleteProductDialog', () => {
  it('stays closed without a product', () => {
    renderDialog({ product: undefined })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // Nombre y SKU: en un catálogo con productos parecidos, el nombre solo no
  // alcanza para saber cuál se está por borrar.
  it('names the product and its sku', () => {
    renderDialog()

    expect(screen.getByText(/Cable UTP Cat6 \(CAB-6-305\)/)).toBeInTheDocument()
  })

  it('confirms only when the person asks for it', () => {
    const { onConfirm } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onConfirm).toHaveBeenCalled()
  })

  it('does not let the buttons fire while the delete is in flight', () => {
    const { onConfirm, onClose } = renderDialog({ deleting: true })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  /**
   * El 409 del backend: el producto tiene ventas o transferencias y
   * `restrict_with_error` impide que un DELETE las evapore. El diálogo queda
   * abierto con el motivo, porque cerrarlo para avisar en otro lado dejaría a
   * la persona sin saber sobre qué producto fue.
   */
  it('explains why the product cannot be deleted', () => {
    renderDialog({ blocked: true })

    expect(screen.getByText(/tiene ventas o transferencias registradas/)).toBeInTheDocument()
  })

  it('takes away the confirm button once the backend refused', () => {
    renderDialog({ blocked: true })

    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })
})
