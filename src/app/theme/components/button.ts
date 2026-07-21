import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'
import type { ThemeMode } from '../tokens'
import { rem } from '../utils'

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
  }
}
