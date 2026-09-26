import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { ModalFrame } from './ModalFrame'
import { ModalBody, ModalFooter } from './ModalFrame.styles'
import type { ModalFrameProps } from './ModalFrame.types'

function renderFrame(overrides: Partial<ModalFrameProps> = {}) {
  const props: ModalFrameProps = {
    open: true,
    title: 'Nuevo producto',
    closeLabel: 'Cerrar',
    onClose: vi.fn(),
    children: <ModalBody>Cuerpo del modal</ModalBody>,
    ...overrides,
  }

  renderWithTheme(<ModalFrame {...props} />)

  return props
}

describe('ModalFrame', () => {
  it('stays closed until it is opened', () => {
    renderFrame({ open: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('is named by its title, with the subtitle and the body inside', () => {
    renderFrame({ subtitle: 'Se agrega una entrada al catálogo maestro.' })

    const dialog = screen.getByRole('dialog', { name: 'Nuevo producto' })

    expect(dialog).toHaveTextContent('Se agrega una entrada al catálogo maestro.')
    expect(dialog).toHaveTextContent('Cuerpo del modal')
  })

  it('closes from the header and with Escape', () => {
    const { onClose } = renderFrame()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // Con algo en vuelo el resultado tiene que llegar a un modal que siga a la
  // vista: no se cierra por ningún lado.
  it('cannot be closed while something is in flight', () => {
    const { onClose } = renderFrame({ busy: true })

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('takes the ModalFrame width of the design unless told otherwise', () => {
    renderFrame()

    expect(screen.getByRole('dialog')).toHaveStyle({ maxWidth: '672px' })
  })

  it('narrows or widens with its size', () => {
    renderFrame({ size: 'lg' })

    expect(screen.getByRole('dialog')).toHaveStyle({ maxWidth: '880px' })
  })

  // Con un tema de dos esquemas, un hex horneado no repinta al cambiar de modo
  // (TESIS-104): el pie tiene que leer la variable del esquema activo.
  it('paints its footer from the color scheme variables', () => {
    renderFrame({ children: <ModalFooter data-testid="footer" /> })

    expect(getComputedStyle(screen.getByTestId('footer')).backgroundColor).toBe(
      'var(--mui-palette-background-default)',
    )
  })

  it('can present itself as an alert dialog described by its body', () => {
    renderFrame({
      role: 'alertdialog',
      describedBy: 'body',
      children: <ModalBody id="body">Esta acción no se puede deshacer.</ModalBody>,
    })

    expect(screen.getByRole('alertdialog', { name: 'Nuevo producto' })).toHaveAccessibleDescription(
      'Esta acción no se puede deshacer.',
    )
  })
})
