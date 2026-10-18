import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { CreateProductModal } from './CreateProductModal'

function renderModal() {
  return renderWithTheme(
    <CreateProductModal
      open
      warehouses={[]}
      categories={[]}
      onSubmit={vi.fn()}
      onClose={vi.fn()}
    />,
  )
}

describe('CreateProductModal', () => {
  // TESIS-182: el alta arranca con el mismo mínimo que pone la API por defecto,
  // así un producto que nadie configuró se comporta como hasta ahora.
  it('starts the low stock threshold at the default of the API', () => {
    renderModal()

    expect(screen.getByRole('spinbutton', { name: /^Stock mínimo/ })).toHaveValue(100)
  })

  it('explains what the threshold means', () => {
    renderModal()

    expect(
      screen.getByText('Con este total o menos, el producto figura con stock bajo.'),
    ).toBeInTheDocument()
  })
})
