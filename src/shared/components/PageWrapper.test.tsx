import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../test/renderWithTheme'

import { PageWrapper } from './PageWrapper'

describe('PageWrapper', () => {
  it('centers the page and caps its width by default', () => {
    renderWithTheme(<PageWrapper>Contenido</PageWrapper>)

    expect(screen.getByRole('main')).toHaveStyle({
      maxWidth: '1200px',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%',
    })
  })

  // Las pantallas anchas le pasan `sx={{ maxWidth: 1400 }}`. Antes ese `sx`
  // reemplazaba al base entero y la página quedaba sin padding ni centrado.
  // Se afirma el centrado y no el padding: el padding va en un media query con
  // `var(--mui-spacing)`, y jsdom no resuelve ninguno de los dos.
  it('keeps the base styles when the caller overrides one of them', () => {
    renderWithTheme(<PageWrapper sx={{ maxWidth: 1400 }}>Contenido</PageWrapper>)

    expect(screen.getByRole('main')).toHaveStyle({
      maxWidth: '1400px',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%',
    })
  })

  it('accepts an array of styles like any other sx', () => {
    renderWithTheme(
      <PageWrapper sx={[{ maxWidth: 1400 }, { minHeight: '100%' }]}>Contenido</PageWrapper>,
    )

    expect(screen.getByRole('main')).toHaveStyle({
      maxWidth: '1400px',
      marginLeft: 'auto',
      minHeight: '100%',
    })
  })
})
