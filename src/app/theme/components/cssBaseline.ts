import type { Components, Theme } from '@mui/material/styles'

import { roleColors } from '../tokens'
import type { ThemeMode } from '../tokens'

export function muiCssBaseline(mode: ThemeMode): Components<Theme>['MuiCssBaseline'] {
  const { accent } = roleColors[mode]

  return {
    styleOverrides: {
      // Suavizado de fuente: evita que el texto claro "sangre" sobre el fondo
      // oscuro y da un render más nítido en ambos temas.
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
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
