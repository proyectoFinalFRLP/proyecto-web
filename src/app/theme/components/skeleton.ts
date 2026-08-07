import type { Components, Theme } from '@mui/material/styles'

import type { ThemeMode } from '../tokens'

// Skeleton del DS: la silueta usa la superficie elevada del tema en vez del gris
// propio de MUI, para que el placeholder pertenezca a la card donde vive.
// `wave` en lugar de `pulse` porque el brillo que recorre la silueta lee mejor
// sobre dark; `cssBaseline` ya neutraliza la animación con prefers-reduced-motion.
export function muiSkeleton(mode: ThemeMode): Components<Theme>['MuiSkeleton'] {
  return {
    defaultProps: { animation: 'wave' },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.containerHighest,
        '&::after': {
          background: `linear-gradient(90deg, transparent, ${
            mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.06)'
          }, transparent)`,
        },
      }),
    },
  }
}
