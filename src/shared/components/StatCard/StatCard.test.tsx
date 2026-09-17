import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('shows the note under the value', () => {
    renderWithTheme(<StatCard label="Unidades" value="67" note="3 líneas" />)

    expect(screen.getByText('3 líneas')).toBeInTheDocument()
  })

  it('renders no empty note when there is nothing to clarify', () => {
    const { container } = renderWithTheme(<StatCard label="Unidades" value="67" note="" />)

    expect(container.textContent).toBe('Unidades67')
  })
})
