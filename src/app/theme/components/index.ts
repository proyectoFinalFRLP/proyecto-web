import type { ThemeOptions } from '@mui/material/styles'

import { muiAppBar } from './appBar'
import { muiButton } from './button'
import { muiCard } from './card'
import { muiCssBaseline } from './cssBaseline'
import { muiBackdrop, muiDialog } from './dialog'
import { muiOutlinedInput, muiTextField } from './input'
import { muiSkeleton } from './skeleton'
import { muiToggleButton, muiToggleButtonGroup } from './toggleButton'
import { muiTypography } from './typography'

// Compone los overrides de MUI. Un archivo por componente: al sumar nuevos,
// se agrega su factory acá y su propio archivo en esta carpeta.
//
// Ninguno recibe el modo: leen los colores de `theme.vars` (una variable CSS por
// esquema) y lo que cambia de forma entre claro y oscuro va en
// `theme.applyStyles`. Así un mismo tema sirve para los dos esquemas (TESIS-104).
export function buildComponents(): ThemeOptions['components'] {
  return {
    MuiCssBaseline: muiCssBaseline(),
    MuiAppBar: muiAppBar(),
    MuiSkeleton: muiSkeleton(),
    MuiButton: muiButton(),
    MuiOutlinedInput: muiOutlinedInput(),
    MuiTextField: muiTextField(),
    MuiCard: muiCard(),
    MuiDialog: muiDialog(),
    MuiBackdrop: muiBackdrop(),
    MuiTypography: muiTypography(),
    MuiToggleButtonGroup: muiToggleButtonGroup(),
    MuiToggleButton: muiToggleButton(),
  }
}
