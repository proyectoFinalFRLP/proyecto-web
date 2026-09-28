import type { TenantBranding } from 'shared/api'
import { describe, expect, it } from 'vitest'

import { brandingFromSlug } from './branding'
import { createAppTheme } from './theme'
import { roleColors } from './tokens'
import type { ThemeMode } from './tokens'

// La paleta de un esquema. El tema trae los dos (TESIS-104): el branding de cada
// esquema entra por su lado, así que los casos piden el que les importa.
function paletteOf(mode: ThemeMode, branding?: TenantBranding) {
  const scheme = createAppTheme({ [mode]: branding }).colorSchemes[mode]
  if (!scheme) throw new Error(`el tema no trae el esquema ${mode}`)
  return scheme.palette
}

describe('createAppTheme without tenant branding', () => {
  // El branding es aditivo: sin config, el tema tiene que ser exactamente el que
  // había antes de que existiera el multi-tenant.
  it.each([
    ['dark', roleColors.dark.primary, '#051424', roleColors.dark.accent],
    ['light', roleColors.light.primary, '#ffffff', roleColors.light.accent],
  ] as const)('keeps the design system palette in %s', (mode, primary, onPrimary, accent) => {
    const palette = paletteOf(mode)

    expect(palette.primary.main).toBe(primary)
    expect(palette.primary.contrastText).toBe(onPrimary)
    expect(palette.secondary.main).toBe(accent)
    expect(palette.secondary.contrastText).toBe('#051424')
  })
})

describe('createAppTheme with tenant branding', () => {
  it('repaints primary and accent with the colors of the tenant', () => {
    const palette = paletteOf('dark', {
      primary_color: '#2E7D32',
      accent_color: '#66BB6A',
    })

    expect(palette.primary.main).toBe('#2E7D32')
    expect(palette.secondary.main).toBe('#66BB6A')
  })

  // El primario del DS en dark es claro y lleva texto oscuro; un verde oscuro de
  // una empresa lleva texto blanco. Por eso el texto se mide en vez de fijarse.
  it('picks the text that can be read over the color of the tenant', () => {
    expect(paletteOf('dark', { primary_color: '#2E7D32' }).primary.contrastText).toBe('#ffffff')
    expect(paletteOf('light', { primary_color: '#8ed5ff' }).primary.contrastText).toBe('#051424')
  })

  // Un jsonb lo carga una persona: puede traer cualquier cosa. Un color que MUI
  // no sabe descomponer haría explotar el tema entero.
  it.each([['verde'], ['rgb(46, 125, 50)'], ['']])(
    'falls back to the design system when the color is %s',
    (color) => {
      const palette = paletteOf('dark', { primary_color: color })

      expect(palette.primary.main).toBe(roleColors.dark.primary)
    },
  )

  it('leaves the rest of the design system alone', () => {
    const branded = paletteOf('dark', { primary_color: '#2E7D32' })
    const plain = paletteOf('dark')

    expect(branded.background.default).toBe(plain.background.default)
    expect(branded.success.main).toBe(plain.success.main)
    expect(createAppTheme({ dark: { primary_color: '#2E7D32' } }).typography.fontFamily).toBe(
      createAppTheme().typography.fontFamily,
    )
  })
})

describe('brandingFromSlug', () => {
  it('derives a stable identity so the splash is never unbranded', () => {
    const first = brandingFromSlug('norte', 'dark')

    expect(first.display_name).toBe('Norte')
    expect(first.primary_color).toMatch(/^#[0-9a-f]{6}$/i)
    expect(brandingFromSlug('norte', 'dark')).toEqual(first)
  })

  it('gives different tenants different colors', () => {
    expect(brandingFromSlug('sur', 'dark').primary_color).not.toBe(
      brandingFromSlug('norte', 'dark').primary_color,
    )
  })

  // Es una derivación del slug, no la marca real: tiene que poder alimentar el
  // tema igual que la config del backend.
  it('produces a color the theme accepts', () => {
    const branding = brandingFromSlug('sur', 'light')
    const palette = paletteOf('light', branding)

    expect(palette.primary.main).toBe(branding.primary_color)
  })
})
