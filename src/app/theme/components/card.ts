import { alpha } from '@mui/material/styles'
import type { Components, Theme } from '@mui/material/styles'

import { radius, roleColors } from '../tokens'
import type { ThemeMode } from '../tokens'

// Elevación del DS: dark = borde blanco 5% sin sombra ("luminous layering");
// light = borde de bajo contraste + sombra ambiental difusa.
export function muiCard(mode: ThemeMode): Components<Theme>['MuiCard'] {
  const cardBorder = mode === 'dark' ? alpha('#ffffff', 0.06) : roleColors.light.outlineVariant

  return {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: radius.lg,
        border: `1px solid ${cardBorder}`,
        backgroundImage: 'none',
        ...(mode === 'light'
          ? { boxShadow: '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)' }
          : {}),
      },
    },
  }
}
