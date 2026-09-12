import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  // Regla del design system: nunca color solo. El texto es lo que hace legible
  // el estado para quien no distingue los tonos.
  it('always shows the label, which is what carries the meaning', () => {
    renderWithTheme(<StatusBadge status="success" label="Entregado" />)

    expect(screen.getByText('Entregado')).toBeInTheDocument()
  })

  it('is not a button when there is nothing to click', () => {
    renderWithTheme(<StatusBadge status="warning" label="En tránsito" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('becomes a button when it receives onClick', async () => {
    const onClick = vi.fn()
    renderWithTheme(<StatusBadge status="info" label="Pendiente" onClick={onClick} />)

    const badge = screen.getByRole('button', { name: 'Pendiente' })
    badge.click()

    expect(onClick).toHaveBeenCalledOnce()
  })

  // Se renderiza como <button type="button">: sin el type explícito, dentro de
  // un formulario dispararía el submit al hacer clic.
  it('does not submit the form it may live in', () => {
    renderWithTheme(<StatusBadge status="error" label="Fallido" onClick={vi.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('forwards the menu attributes it is given', () => {
    renderWithTheme(
      <StatusBadge
        status="neutral"
        label="Borrador"
        onClick={vi.fn()}
        aria-haspopup
        aria-controls="status-menu"
      />,
    )

    const badge = screen.getByRole('button')
    expect(badge).toHaveAttribute('aria-haspopup', 'true')
    expect(badge).toHaveAttribute('aria-controls', 'status-menu')
  })

  it('renders the icons around the label', () => {
    renderWithTheme(
      <StatusBadge
        status="success"
        label="Entregado"
        icon={<span data-testid="leading" />}
        endIcon={<span data-testid="trailing" />}
      />,
    )

    expect(screen.getByTestId('leading')).toBeInTheDocument()
    expect(screen.getByTestId('trailing')).toBeInTheDocument()
  })

  // El texto del badge cambia de rol entre modos (en oscuro usa el tono `main`,
  // en claro el `onContainer`). Si el tema dejara de resolver alguno, el
  // componente se pintaría con el mismo color en los dos.
  it('paints the label differently in each theme mode', () => {
    const dark = renderWithTheme(<StatusBadge status="success" label="Entregado" />, {
      mode: 'dark',
    })
    const darkColor = getComputedStyle(dark.getByText('Entregado')).color
    dark.unmount()

    const light = renderWithTheme(<StatusBadge status="success" label="Entregado" />, {
      mode: 'light',
    })
    const lightColor = getComputedStyle(light.getByText('Entregado')).color

    expect(darkColor).not.toBe('')
    expect(darkColor).not.toBe(lightColor)
  })
})
