import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const CARD_WIDTH = 440
const CARD_RADIUS = 12
const TOP_BAR_HEIGHT = 61
const GLOW_SIZE = 400

export const ShellRoot = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
}))

export const TopBar = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  minHeight: TOP_BAR_HEIGHT,
  paddingInline: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

export const ShellMain = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
}))

export const ShellFooter = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
}))

// Halos decorativos del fondo, como en el diseño. Puramente ornamentales, así
// que quedan fuera del flujo y sin captura de eventos.
export const BackgroundGlow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'placement',
})<{ placement: 'top' | 'bottom' }>(({ theme, placement }) => ({
  position: 'absolute',
  width: GLOW_SIZE,
  height: GLOW_SIZE,
  borderRadius: '50%',
  filter: 'blur(80px)',
  pointerEvents: 'none',
  backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 12%, transparent)`,
  ...(placement === 'top'
    ? { top: -GLOW_SIZE / 2, right: -GLOW_SIZE / 4 }
    : { bottom: -GLOW_SIZE / 2, left: -GLOW_SIZE / 4 }),
}))

export const AuthCard = styled(Box)(({ theme }) => ({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: CARD_WIDTH,
  padding: theme.spacing(4),
  borderRadius: CARD_RADIUS,
  backgroundColor: theme.palette.background.paper,
  border: theme.elevation[1].border,
  boxShadow: theme.elevation[2].boxShadow,
}))

export const BrandMark = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 12%, transparent)`,
  color: theme.palette.primary.main,
  '& svg': { display: 'block', fontSize: 24 },
}))
