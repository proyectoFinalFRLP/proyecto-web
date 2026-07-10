import type { Components, Theme } from '@mui/material/styles'

import { roleColors } from '../tokens'
import type { ThemeMode } from '../tokens'

export function muiCssBaseline(mode: ThemeMode): Components<Theme>['MuiCssBaseline'] {
  const { accent } = roleColors[mode]

  return {
    styleOverrides: {
      // Focus ring visible — WCAG 2.4.7.
      ':focus-visible': { outline: `2px solid ${accent}`, outlineOffset: '2px' },
      // Respeta prefers-reduced-motion: solo fades, sin translate/scale/shimmer.
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  }
}
