import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { Product } from '../../types'

import { EditProductModal } from './EditProductModal'

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 5,
    sku: 'CAB-6-305',
    name: 'Cable UTP Cat6',
    description: 'Rollo de 305 metros',
    weight: 12.4,
    dimensions: '45x30x20',
    stocks: [
      {
        warehouseId: 1,
        quantity: 10,
        warehouse: { id: 1, name: 'CD Ezeiza', address: 'Autopista Riccheri km 33' },
      },
    ],
    updatedAt: '2026-08-30T12:00:00.000Z',
    version: '"abc"',
    ...overrides,
  }
}

function renderModal(initial: Product) {
  const props = {
    open: true,
    warehouses: [],
    onSubmit: vi.fn(),
    onClose: vi.fn(),
  }

  const view = renderWithTheme(<EditProductModal {...props} product={initial} />)

  return {
    ...view,
    props,
    show: (next: Product) => view.rerender(<EditProductModal {...props} product={next} />),
  }
}

describe('EditProductModal', () => {
  it('fills the form with the values of the product it receives', () => {
    renderModal(product())

    expect(screen.getByDisplayValue('Cable UTP Cat6')).toBeInTheDocument()
  })

  /**
   * La regresión que rompía la promesa de TESIS-101.
   *
   * Al llegar un 412 la página refetchea el detalle, así que el modal recibe un
   * objeto nuevo con el MISMO producto. Con `product` como disparador del efecto
   * de relleno, ese refetch reseteaba el formulario y borraba lo que el usuario
   * tenía tipeado — justo mientras el aviso de conflicto le decía que sus
   * cambios seguían ahí.
   */
  it('keeps what the user typed when the same product is read again', () => {
    const { show } = renderModal(product())

    fireEvent.change(screen.getByDisplayValue('Cable UTP Cat6'), {
      target: { value: 'Cable que el usuario estaba editando' },
    })

    // Otra referencia, mismo id: es exactamente lo que devuelve el refetch.
    show(product({ name: 'Nombre que puso el otro operador' }))

    expect(screen.getByDisplayValue('Cable que el usuario estaba editando')).toBeInTheDocument()
  })

  it('fills the form again when it switches to a different product', () => {
    const { show } = renderModal(product())

    fireEvent.change(screen.getByDisplayValue('Cable UTP Cat6'), {
      target: { value: 'A medio escribir' },
    })

    show(product({ id: 9, name: 'Otro producto' }))

    expect(screen.getByDisplayValue('Otro producto')).toBeInTheDocument()
  })

  it('lists what changed, one entry per conflict', () => {
    const view = renderModal(product())
    view.rerender(
      <EditProductModal
        {...view.props}
        product={product()}
        conflict={[
          { id: 'name', text: 'Nombre: A → B' },
          { id: 'stock:1', text: 'Stock en Central: 10 → 4' },
          { id: 'stock:2', text: 'Stock en Central: 10 → 6' },
        ]}
      />,
    )

    // Dos depósitos con el mismo nombre producen textos distintos pero podrían
    // colisionar como clave: las tres entradas tienen que estar.
    expect(screen.getByText('Nombre: A → B')).toBeInTheDocument()
    expect(screen.getByText('Stock en Central: 10 → 4')).toBeInTheDocument()
    expect(screen.getByText('Stock en Central: 10 → 6')).toBeInTheDocument()
  })

  it('does not let the close button fire while the save is in flight', () => {
    const view = renderModal(product())
    view.rerender(<EditProductModal {...view.props} product={product()} submitting />)

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(view.props.onClose).not.toHaveBeenCalled()
  })
})
