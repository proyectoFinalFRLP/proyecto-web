import type { Components, Theme } from '@mui/material/styles'

// El acento es `secondary.main`: el del tenant si lo tiene, el del DS si no. Se
// lee de `theme.vars` para que el anillo de foco cambie con el esquema.
export function muiCssBaseline(): Components<Theme>['MuiCssBaseline'] {
  return {
    styleOverrides: (theme) => ({
      // Suavizado de fuente: evita que el texto claro "sangre" sobre el fondo
      // oscuro y da un render más nítido en ambos temas.
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      // Focus ring visible — WCAG 2.4.7.
      ':focus-visible': {
        outline: `2px solid ${theme.vars.palette.secondary.main}`,
        outlineOffset: '2px',
      },
      // Respeta prefers-reduced-motion: solo fades, sin translate/scale/shimmer.
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    }),
  }
}
