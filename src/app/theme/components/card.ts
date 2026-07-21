import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'

// La card usa el nivel 1 de la escala de elevación (borde + sombra según el tema).
export function muiCard(): Components<Theme>['MuiCard'] {
  return {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.lg,
        backgroundImage: 'none',
        border: theme.elevation[1].border,
        boxShadow: theme.elevation[1].boxShadow,
      }),
    },
  }
}
