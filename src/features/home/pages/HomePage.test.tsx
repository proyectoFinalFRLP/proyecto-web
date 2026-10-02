import { screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from 'shared/store'
import { afterEach, describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { HomePage } from './HomePage'

function renderHome() {
  renderWithTheme(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

const shortcuts = () => within(screen.getByRole('navigation', { name: 'Dónde ir' }))

afterEach(() => {
  useAuthStore.setState({ user: null })
})

describe('HomePage', () => {
  it('takes to each everyday screen', () => {
    renderHome()

    expect(shortcuts().getByRole('link', { name: /Panel de operación/ })).toHaveAttribute(
      'href',
      '/dashboard',
    )
    expect(shortcuts().getByRole('link', { name: /Nueva orden/ })).toHaveAttribute(
      'href',
      '/orders/new',
    )
    expect(shortcuts().getByRole('link', { name: /^Órdenes/ })).toHaveAttribute('href', '/orders')
    expect(shortcuts().getByRole('link', { name: /Inventario/ })).toHaveAttribute(
      'href',
      '/inventory',
    )
    expect(shortcuts().getByRole('link', { name: /Reportes/ })).toHaveAttribute('href', '/reports')
  })

  // El panel existe desde TESIS-53/56: el aviso de que «llegaba más adelante»
  // quedó desmentido.
  it('no longer says the operation panel is coming later', () => {
    renderHome()

    expect(screen.queryByText(/llega más adelante/)).not.toBeInTheDocument()
  })

  it('says who holds the session', () => {
    useAuthStore.setState({ user: { email: 'admin@norte.com' } } as never)

    renderHome()

    expect(screen.getByText('Sesión iniciada como admin@norte.com')).toBeInTheDocument()
  })
})
