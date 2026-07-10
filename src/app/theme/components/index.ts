import type { ThemeOptions } from '@mui/material/styles'

import type { ThemeMode } from '../tokens'

import { muiCard } from './card'
import { muiCssBaseline } from './cssBaseline'
import { muiTypography } from './typography'

// Compone los overrides de MUI. Un archivo por componente: al sumar nuevos,
// se agrega su factory acá y su propio archivo en esta carpeta.
export function buildComponents(mode: ThemeMode): ThemeOptions['components'] {
  return {
    MuiCssBaseline: muiCssBaseline(mode),
    MuiCard: muiCard(),
    MuiTypography: muiTypography(),
  }
}
