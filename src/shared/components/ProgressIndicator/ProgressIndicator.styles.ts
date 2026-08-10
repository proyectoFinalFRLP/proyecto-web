import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

import type { ProgressSize, ProgressTone } from './ProgressIndicator.types'

// Alturas por densidad (px). `large` es la fila con label al costado.
const BAR_HEIGHTS: Record<ProgressSize, number> = { thin: 4, medium: 8, large: 16 }

const STEP_HEIGHT = 6
const STEP_GAP = 6
const INDETERMINATE_WIDTH = '40%'

const TRANSIENT_PROPS = new Set<string>(['tone', 'barSize', 'filled'])

const notForwarded = (prop: string | number | symbol) => !TRANSIENT_PROPS.has(prop as string)

// Canal de la barra: tinte del mismo tono, para que el recorrido pendiente se
// lea como "lo que falta de esto" y no como un gris ajeno a la métrica.
function trackColor(theme: Theme, tone: ProgressTone) {
  return `color-mix(in srgb, ${theme.palette[tone].main} 16%, transparent)`
}

export const Root = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
})

export const InlineRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
}))

export const HeaderRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 12,
})

export const Track = styled(Box, { shouldForwardProp: notForwarded })<{
  tone: ProgressTone
  barSize: ProgressSize
}>(({ theme, tone, barSize }) => ({
  position: 'relative',
  // `flexBasis: auto` es deliberado: con `flex: 1` la base sería 0% y en el
  // layout stacked (contenedor en columna) eso colapsa la ALTURA del canal a
  // cero. Con base auto la altura la manda `height` y el crecimiento sólo
  // actúa a lo ancho en el layout inline.
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 'auto',
  minWidth: 0,
  height: BAR_HEIGHTS[barSize],
  borderRadius: 9999,
  overflow: 'hidden',
  backgroundColor: trackColor(theme, tone),
  border: barSize === 'large' ? `1px solid ${theme.palette.divider}` : undefined,
}))

export const Fill = styled(Box, { shouldForwardProp: notForwarded })<{ tone: ProgressTone }>(
  ({ theme, tone }) => ({
    height: '100%',
    borderRadius: 9999,
    backgroundColor: theme.palette[tone].main,
    boxShadow: `0 0 12px color-mix(in srgb, ${theme.palette[tone].main} 30%, transparent)`,
    transition: theme.transitions.create('width'),
  }),
)

// Indeterminado: un tramo que recorre el canal. Con `prefers-reduced-motion`
// se detiene y ocupa todo el canal atenuado, sin dejar la barra vacía.
export const IndeterminateFill = styled(Box, { shouldForwardProp: notForwarded })<{
  tone: ProgressTone
}>(({ theme, tone }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  width: INDETERMINATE_WIDTH,
  borderRadius: 9999,
  backgroundColor: theme.palette[tone].main,
  '@keyframes dsProgressSlide': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(250%)' },
  },
  animation: 'dsProgressSlide 1.4s ease-in-out infinite',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    width: '100%',
    opacity: 0.4,
  },
}))

export const StepsRow = styled(Box)({
  display: 'flex',
  gap: STEP_GAP,
  width: '100%',
})

export const Step = styled(Box, { shouldForwardProp: notForwarded })<{
  tone: ProgressTone
  filled: boolean
}>(({ theme, tone, filled }) => ({
  flex: 1,
  minWidth: 0,
  height: STEP_HEIGHT,
  borderRadius: 9999,
  backgroundColor: filled ? theme.palette[tone].main : trackColor(theme, tone),
  transition: theme.transitions.create('background-color'),
}))

export const SkeletonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
  opacity: 0.6,
}))

export const SkeletonLines = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  minWidth: 0,
})
