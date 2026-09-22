import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import { SAMPLE_OVERVIEW } from '../../sampleData'

import { ServiceLevelCard } from './ServiceLevelCard'

describe('ServiceLevelCard', () => {
  it('lists the four carriers of the product with their rate', () => {
    renderWithTheme(<ServiceLevelCard levels={SAMPLE_OVERVIEW.serviceLevels} />)

    expect(screen.getByText('Andreani')).toBeInTheDocument()
    expect(screen.getByText('99,4%')).toBeInTheDocument()
    expect(screen.getByText('OCASA')).toBeInTheDocument()
    expect(screen.getByText('88,5%')).toBeInTheDocument()
  })

  // El rótulo visible vive fuera de la barra: cada una tiene que anunciar de
  // qué operador es y cuánto vale.
  it('exposes each bar as a named progressbar with its value', () => {
    renderWithTheme(<ServiceLevelCard levels={SAMPLE_OVERVIEW.serviceLevels} />)

    const bar = screen.getByRole('progressbar', { name: 'Entregas en plazo de Moova' })
    expect(bar).toHaveAttribute('aria-valuenow', '97')
  })

  it('keeps the order it receives: it is a ranking', () => {
    renderWithTheme(<ServiceLevelCard levels={SAMPLE_OVERVIEW.serviceLevels} />)

    const items = screen.getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      'Andreani99,4%',
      'Moova96,8%',
      'Correo Argentino94,2%',
      'OCASA88,5%',
    ])
  })
})
