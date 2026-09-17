import type { ThemeOptions } from '@mui/material/styles'

import type { ThemeMode } from '../tokens'

import { muiAppBar } from './appBar'
import { muiButton } from './button'
import { muiCard } from './card'
import { muiCssBaseline } from './cssBaseline'
import { muiBackdrop, muiDialog } from './dialog'
import { muiOutlinedInput, muiTextField } from './input'
import { muiSkeleton } from './skeleton'
import { muiTypography } from './typography'

// Compone los overrides de MUI. Un archivo por componente: al sumar nuevos,
// se agrega su factory acá y su propio archivo en esta carpeta.
//
// `accent` es el acento ya resuelto (el del tenant o el del DS). Lo reciben los
// dos overrides que lo leían directo de los tokens y por eso no se enteraban del
// branding: el anillo de foco global y el input enfocado.
export function buildComponents(mode: ThemeMode, accent?: string): ThemeOptions['components'] {
  return {
    MuiCssBaseline: muiCssBaseline(mode, accent),
    MuiAppBar: muiAppBar(),
    MuiSkeleton: muiSkeleton(mode),
    MuiButton: muiButton(mode),
    MuiOutlinedInput: muiOutlinedInput(mode, accent),
    MuiTextField: muiTextField(),
    MuiCard: muiCard(),
    MuiDialog: muiDialog(),
    MuiBackdrop: muiBackdrop(),
    MuiTypography: muiTypography(),
  }
}
