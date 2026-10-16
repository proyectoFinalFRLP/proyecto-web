import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { WizardNextButton } from './WizardNextButton'

function renderButton(props: { gaps: string[]; disabled: boolean; onClick?: () => void }) {
  renderWithTheme(
    <WizardNextButton label="Siguiente: destino y origen" onClick={vi.fn()} {...props} />,
  )
  return screen.getByRole('button', { name: 'Siguiente: destino y origen' })
}

describe('WizardNextButton', () => {
  it('says what is missing under a disabled button', () => {
    renderButton({ gaps: ['el DNI / CUIT'], disabled: true })

    expect(screen.getByText('Para seguir, falta el DNI / CUIT.')).toBeInTheDocument()
  })

  // Lo oye también quien llega al botón con el teclado o el lector de pantalla.
  it('ties the explanation to the button', () => {
    const button = renderButton({ gaps: ['el nombre', 'el DNI / CUIT'], disabled: true })

    expect(button).toHaveAccessibleDescription('Para seguir, faltan el nombre y el DNI / CUIT.')
  })

  it('says nothing once the button is enabled', () => {
    const button = renderButton({ gaps: [], disabled: false })

    expect(screen.queryByText(/^Para seguir/)).not.toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-describedby')
  })

  // La lista puede llegar un render tarde respecto de `disabled`: con el botón
  // ya habilitado no se muestra una explicación que sobra.
  it('does not explain a button that is already enabled', () => {
    renderButton({ gaps: ['el nombre'], disabled: false })

    expect(screen.queryByText(/^Para seguir/)).not.toBeInTheDocument()
  })

  it('advances when clicked', () => {
    const onClick = vi.fn()
    fireEvent.click(renderButton({ gaps: [], disabled: false, onClick }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
