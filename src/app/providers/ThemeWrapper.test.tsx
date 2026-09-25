import { act, render, screen } from '@testing-library/react'
import { ProgressIndicator } from 'shared/components'
import { useTenantStore } from 'shared/store'
import { useUiStore } from 'shared/store/uiStore'
import { beforeEach, describe, expect, it } from 'vitest'

import { roleColors } from '../theme/tokens'

import { ThemeWrapper } from './ThemeWrapper'

// El toggle de tema (TESIS-104). Lorenzo vio componentes que no se repintaban
// al alternar, contra `primary.main`. La causa de fondo: cada `styled()` leía
// `theme.palette`, que horneaba el hex del modo en su clase, y el cambio de
// modo dependía de que React rearmara el tema y volviera a serializar cada
// componente. Ahora los estilos leen la variable CSS y el modo es un atributo
// del `<html>`.

function renderPrimaryFill() {
  render(
    <ThemeWrapper>
      <ProgressIndicator value={50} tone="primary" ariaLabel="Avance" />
    </ThemeWrapper>,
  )
  // El relleno de la barra se pinta con `primary.main` desde un `styled()`.
  const fill = screen.getByRole('progressbar').firstElementChild
  if (!(fill instanceof HTMLElement)) throw new Error('la barra no tiene relleno')
  return fill
}

const scheme = () =>
  document.documentElement.getAttributeNames().filter((name) => name.startsWith('data-'))
const styleTags = () => document.querySelectorAll('style').length
// Emotion inserta por CSSOM: el CSS está en las reglas de cada hoja, no en el
// texto de los `<style>`.
const allCss = () =>
  [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText))
    .join('')
// MUI apaga las transiciones mientras cambia el esquema con un `<style>` que
// retira en el tick siguiente (`disableTransitionOnChange`): se cuenta después.
const nextTick = () => act(() => new Promise((resolve) => setTimeout(resolve, 10)))

function setMode(mode: 'light' | 'dark') {
  act(() => useUiStore.setState({ themeChoice: mode }))
}

beforeEach(() => {
  localStorage.clear()
  useUiStore.setState({ themeChoice: 'dark' })
  // Sin tenant: el tema es el del DS tal cual, y `primary.main` es el de los
  // tokens en cada esquema (con un slug, sería el color derivado del slug).
  useTenantStore.setState({ slug: null, config: null })
})

describe('ThemeWrapper', () => {
  it('switches the color scheme of the page both ways, without reloading', () => {
    renderPrimaryFill()
    expect(scheme()).toEqual(['data-dark'])

    setMode('light')
    expect(scheme()).toEqual(['data-light'])

    setMode('dark')
    expect(scheme()).toEqual(['data-dark'])
  })

  // El caso que reprodujo Lorenzo, explícito: el color sale de la variable del
  // esquema activo, no de un hex fijado en la clase del componente.
  it('paints primary.main from the variable of the active scheme, not from a baked hex', () => {
    const fill = renderPrimaryFill()

    expect(getComputedStyle(fill).backgroundColor).toBe('var(--mui-palette-primary-main)')
    setMode('light')
    expect(getComputedStyle(fill).backgroundColor).toBe('var(--mui-palette-primary-main)')
  })

  it('defines primary.main with the color of each scheme', () => {
    renderPrimaryFill()
    const css = allCss().replace(/\s/g, '')

    expect(css).toContain(`--mui-palette-primary-main:${roleColors.dark.primary}`)
    expect(css).toContain(`--mui-palette-primary-main:${roleColors.light.primary}`)
  })

  // La medición de la card: antes, el primer toggle agregaba cientos de
  // `<style>` (470 en /design-system), uno por cada componente que se volvía a
  // serializar con los colores del otro modo. Ahora alternar no genera nada.
  it('does not generate new styles when the mode changes', async () => {
    renderPrimaryFill()
    await nextTick()
    const before = styleTags()

    setMode('light')
    await nextTick()
    setMode('dark')
    await nextTick()

    expect(styleTags()).toBe(before)
  })
})
