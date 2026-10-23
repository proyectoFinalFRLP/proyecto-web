import { getContrastRatio } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'

import { createAppTheme } from './theme'
import { inputColors, roleColors, semanticColors } from './tokens'
import type { ThemeMode } from './tokens'

function paletteOf(mode: ThemeMode) {
  const scheme = createAppTheme().colorSchemes[mode]
  if (!scheme) throw new Error(`el tema no trae el esquema ${mode}`)
  return scheme.palette
}

// `error.main` es también color de texto: el helper text de los campos con
// error, los avisos en línea y las acciones destructivas lo usan tal cual. En
// claro el tono del DS original daba 3.7:1 sobre blanco (TESIS-91); esto evita
// que vuelva a un valor que no llega al 4.5:1 de WCAG AA.
describe('error text contrast', () => {
  const backgrounds: Record<ThemeMode, Record<string, string>> = {
    light: {
      surface: roleColors.light.surface,
      page: roleColors.light.background,
      inputFill: inputColors.light.fill,
      container: semanticColors.error.containerL,
    },
    dark: {
      surface: roleColors.dark.surface,
      page: roleColors.dark.background,
      inputFill: inputColors.dark.fill,
    },
  }

  it.each(['light', 'dark'] as const)('meets AA for error.main in %s mode', (mode) => {
    const errorMain = paletteOf(mode).error.main

    const failing = Object.entries(backgrounds[mode])
      .map(([name, background]) => ({ name, ratio: getContrastRatio(errorMain, background) }))
      .filter(({ ratio }) => ratio < 4.5)

    expect(failing).toEqual([])
  })
})
