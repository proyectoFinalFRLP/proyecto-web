import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'
import type { ThemeMode } from '../tokens'
import { rem } from '../utils'

// Intenciones sobre las que se genera la variante glass. Son las mismas keys de
// paleta que ya usa la matriz de botones del design system.
const INTENTS = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral'] as const

// Opacidades del relleno translúcido: reposo, hover y borde.
const GLASS_FILL = 8
const GLASS_FILL_HOVER = 16
const GLASS_BORDER = 30

// Light: el botón sólido usa el tono `strong` de su intención (regla del DS).
function solidStrongBackground({
  ownerState,
  theme,
}: {
  ownerState: { color?: string }
  theme: Theme
}) {
  const color = ownerState.color
  if (!color || color === 'inherit') return {}
  const paletteColor = (theme.palette as unknown as Record<string, { strong?: string }>)[color]
  if (!paletteColor?.strong) return {}
  return {
    backgroundColor: paletteColor.strong,
    '&:hover': { backgroundColor: paletteColor.strong },
  }
}

/**
 * Variante `glass`: relleno translúcido del propio tono + borde de un pelo.
 *
 * Es la acción secundaria sobre superficies profundas — se lee como parte del
 * fondo en lugar de competir con la acción principal, pero conserva el color de
 * su intención. Hay una entrada por intención para que el prop `color` siga
 * funcionando igual que en el resto de las variantes.
 */
const glassVariants = INTENTS.map((intent) => ({
  props: { variant: 'glass' as const, color: intent },
  style: ({ theme }: { theme: Theme }) => {
    const { main } = theme.palette[intent]
    const tint = (percent: number) => `color-mix(in srgb, ${main} ${percent}%, transparent)`

    return {
      color: main,
      backgroundColor: tint(GLASS_FILL),
      border: `1px solid ${tint(GLASS_BORDER)}`,
      transition: theme.transitions.create(['background-color', 'border-color']),
      '&:hover': { backgroundColor: tint(GLASS_FILL_HOVER) },
      '&.Mui-disabled': {
        color: theme.palette.text.disabled,
        backgroundColor: 'transparent',
        borderColor: theme.palette.divider,
      },
    }
  },
}))

export function muiButton(mode: ThemeMode): Components<Theme>['MuiButton'] {
  return {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: radius.base,
        // El estado deshabilitado neutraliza la intención (gris + not-allowed).
        '&.Mui-disabled': { cursor: 'not-allowed', pointerEvents: 'auto' },
      },
      sizeSmall: { minHeight: 32, paddingLeft: 12, paddingRight: 12, fontSize: rem(13) },
      sizeMedium: { minHeight: 40, paddingLeft: 16, paddingRight: 16, fontSize: rem(14) },
      sizeLarge: { minHeight: 48, paddingLeft: 20, paddingRight: 20, fontSize: rem(15) },
      ...(mode === 'light' ? { contained: solidStrongBackground } : {}),
    },
    variants: glassVariants,
  }
}
