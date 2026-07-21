import type { ThemeOptions } from '@mui/material/styles'

import type { ThemeMode } from '../tokens'

import { muiButton } from './button'
import { muiCard } from './card'
import { muiCssBaseline } from './cssBaseline'
import { muiOutlinedInput, muiTextField } from './input'
import { muiTypography } from './typography'

// Compone los overrides de MUI. Un archivo por componente: al sumar nuevos,
// se agrega su factory acá y su propio archivo en esta carpeta.
export function buildComponents(mode: ThemeMode): ThemeOptions['components'] {
  return {
    MuiCssBaseline: muiCssBaseline(mode),
    MuiButton: muiButton(mode),
    MuiOutlinedInput: muiOutlinedInput(mode),
    MuiTextField: muiTextField(),
    MuiCard: muiCard(),
    MuiTypography: muiTypography(),
  }
}
