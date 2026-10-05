import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import { SAMPLE_OVERVIEW } from '../../sampleData'

import { ServiceLevelCard } from './ServiceLevelCard'

describe('ServiceLevelCard', () => {
  it('lists each carrier with how many of its shipments were delivered', () => {
    renderWithTheme(<ServiceLevelCard carriers={SAMPLE_OVERVIEW.carriers} />)

    expect(screen.getByText('Andreani')).toBeInTheDocument()
    expect(screen.getByText('171 de 180')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
  })

  // El rótulo visible vive fuera de la barra: cada una tiene que anunciar de
  // qué operador es y cuánto vale.
  it('exposes each bar as a named progressbar with its value', () => {
    renderWithTheme(<ServiceLevelCard carriers={SAMPLE_OVERVIEW.carriers} />)

    const bar = screen.getByRole('progressbar', { name: 'Envíos entregados de Moova' })
    expect(bar).toHaveAttribute('aria-valuenow', '93')
  })

  it('keeps the order it receives: the API ranks by volume', () => {
    renderWithTheme(<ServiceLevelCard carriers={SAMPLE_OVERVIEW.carriers} />)

    const names = screen.getAllByRole('listitem').map((item) => item.textContent ?? '')
    expect(names.map((text) => text.split(/\d/)[0])).toEqual([
      'Andreani',
      'Moova',
      'Correo Argentino',
    ])
  })

  it('says so when nothing was dispatched in the period', () => {
    renderWithTheme(<ServiceLevelCard carriers={[]} />)

    expect(screen.getByText('No se despacharon envíos en el período.')).toBeInTheDocument()
  })

  // Sin despachos no hay tasa: el 0/0 no puede convertirse en NaN.
  it('shows a zero rate for a carrier with no dispatched shipments', () => {
    renderWithTheme(
      <ServiceLevelCard carriers={[{ carrier: 'OCA', dispatched: 0, delivered: 0 }]} />,
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
