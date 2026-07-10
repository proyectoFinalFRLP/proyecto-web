import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

import type { StatusBadgeSize, StatusVariant } from './StatusBadge.types'

// Altura fija por tamaño → el badge mide igual con o sin ícono, y el contenido
// queda centrado verticalmente. Valores en px.
export const BADGE_SIZES: Record<
  StatusBadgeSize,
  { height: number; fontSize: number; paddingInline: number; gap: number; iconSize: number }
> = {
  sm: { height: 18, fontSize: 10, paddingInline: 8, gap: 4, iconSize: 12 },
  md: { height: 20, fontSize: 11, paddingInline: 10, gap: 6, iconSize: 14 },
  lg: { height: 24, fontSize: 12, paddingInline: 12, gap: 6, iconSize: 16 },
}

interface BadgeRootProps {
  statusColor: StatusVariant
  badgeSize: StatusBadgeSize
  interactive: boolean
  /** Se reenvía al DOM cuando el badge se renderiza como <button>. */
  type?: 'button' | 'submit' | 'reset'
}

const TRANSIENT_PROPS = new Set<string>(['statusColor', 'badgeSize', 'interactive'])

// Shell del badge (fondo = tono `container`, texto = `base` en dark /
// `onContainer` en light, radio `full`, UPPERCASE). Fiel al DS.
export const BadgeRoot = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<BadgeRootProps>(({ theme, statusColor, badgeSize, interactive }) => {
  const size = BADGE_SIZES[badgeSize]
  const color = theme.palette[statusColor]
  const isDark = theme.palette.mode === 'dark'

  return {
    boxSizing: 'border-box',
    height: size.height,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: size.gap,
    paddingInline: `${size.paddingInline}px`,
    borderRadius: 9999,
    backgroundColor: color.container,
    color: isDark ? color.main : color.onContainer,
    border: isDark
      ? `1px solid color-mix(in srgb, ${color.main} 25%, transparent)`
      : '1px solid transparent',
    fontFamily: theme.typography.fontFamily,
    fontSize: size.fontSize,
    fontWeight: 700,
    lineHeight: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    '& svg': { display: 'block', fontSize: size.iconSize },
    ...(interactive && {
      appearance: 'none',
      margin: 0,
      cursor: 'pointer',
      transition: theme.transitions.create(['background-color', 'border-color']),
      '&:hover': { backgroundColor: `color-mix(in srgb, ${color.main} 20%, transparent)` },
    }),
  }
})
