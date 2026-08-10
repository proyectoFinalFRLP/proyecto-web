import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

import type { StatTone } from './StatCard.types'

// Geometría de la tarjeta (px). El radio 12 es el `radius.md` del DS; no se lee
// del tema porque `shape.borderRadius` es el radio base (8) de los controles.
const CARD_RADIUS = 12
const ICON_BOX = 40
const COMPACT_ICON_BOX = 32
const CHIP_HEIGHT = 22
const GLOW_SIZE = 64

const TRANSIENT_PROPS = new Set<string>(['tone', 'accent'])

const notForwarded = (prop: string | number | symbol) => !TRANSIENT_PROPS.has(prop as string)

interface ToneProps {
  tone: StatTone
}

// Tinte del tono sobre la superficie. En dark el contenido va en `main` (más
// luminoso) y en light en `onContainer`, igual que StatusBadge.
function toneSurface(theme: Theme, tone: StatTone) {
  const color = theme.palette[tone]
  return {
    backgroundColor: color.container,
    color: theme.palette.mode === 'dark' ? color.main : color.onContainer,
  }
}

export const CardRoot = styled(Box, { shouldForwardProp: notForwarded })<{
  accent: StatTone | null
}>(({ theme, accent }) => ({
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  height: '100%',
  padding: theme.spacing(3),
  borderRadius: CARD_RADIUS,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.elevation[1].boxShadow,
  border: accent
    ? `1px solid color-mix(in srgb, ${theme.palette[accent].main} 30%, transparent)`
    : theme.elevation[1].border,
}))

// Fila superior: ícono a la izquierda, chip a la derecha.
export const CardHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
})

export const IconBox = styled(Box, { shouldForwardProp: notForwarded })<ToneProps>(
  ({ theme, tone }) => ({
    width: ICON_BOX,
    height: ICON_BOX,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...toneSurface(theme, tone),
    '& svg': { display: 'block', fontSize: 20 },
  }),
)

// Chip de tendencia o etiqueta fija (`LIVE`).
export const MetaChip = styled(Box, { shouldForwardProp: notForwarded })<ToneProps>(
  ({ theme, tone }) => ({
    boxSizing: 'border-box',
    height: CHIP_HEIGHT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    borderRadius: 4,
    ...toneSurface(theme, tone),
    border: `1px solid color-mix(in srgb, ${theme.palette[tone].main} 25%, transparent)`,
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    '& svg': { display: 'block', fontSize: 14 },
  }),
)

// Halo decorativo del ángulo superior derecho — sólo en tarjetas con acento.
export const CornerGlow = styled(Box, { shouldForwardProp: notForwarded })<ToneProps>(
  ({ theme, tone }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderBottomLeftRadius: 9999,
    backgroundColor: `color-mix(in srgb, ${theme.palette[tone].main} 12%, transparent)`,
    pointerEvents: 'none',
  }),
)

export const CardBody = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
})

export const ComparisonFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
}))

export const ComparisonSlot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  flex: 1,
})

export const ComparisonDivider = styled(Box)(({ theme }) => ({
  width: 1,
  height: 32,
  flexShrink: 0,
  backgroundColor: theme.palette.divider,
}))

// Variante condensada: ícono + label/valor en una sola fila.
export const CompactRoot = styled(Box)(({ theme }) => ({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: CARD_RADIUS,
  backgroundColor: theme.palette.background.paper,
  border: theme.elevation[1].border,
  boxShadow: theme.elevation[1].boxShadow,
}))

export const CompactIconBox = styled(Box, { shouldForwardProp: notForwarded })<ToneProps>(
  ({ theme, tone }) => ({
    width: COMPACT_ICON_BOX,
    height: COMPACT_ICON_BOX,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...toneSurface(theme, tone),
    '& svg': { display: 'block', fontSize: 16 },
  }),
)

export const CompactBody = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})
