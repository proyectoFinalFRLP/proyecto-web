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

// Shell del badge (fondo = tono `container`, texto = `onContainer` en los dos
// modos, radio `full`, UPPERCASE). Fiel al DS: `docs/design/StatusBadge.dc.html`
// pinta el texto con `--err-fg`/`--ok-fg`/…, que en dark son los tonos `textD`.
export const BadgeRoot = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<BadgeRootProps>(({ theme, statusColor, badgeSize, interactive }) => {
  const size = BADGE_SIZES[badgeSize]
  const color = theme.vars.palette[statusColor]

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
    color: color.onContainer,
    border: '1px solid transparent',
    // En dark el borde se tiñe con `main`. Va en `applyStyles` y no en un `if`
    // sobre el modo: el mismo estilo sirve para los dos esquemas y el navegador
    // aplica esta parte cuando está en oscuro.
    //
    // El texto en dark iba en `main` (#fb7185 para error): sobre la fila
    // `critical` de DataTable, que ya viene teñida de rojo, quedaba en 4.41:1 y
    // no llegaba al 4.5:1 de WCAG AA (axe, TESIS-91). `onContainer` es el tono
    // que el DS define para texto sobre el contenedor y pasa holgado (~8.4:1).
    ...theme.applyStyles('dark', {
      border: `1px solid color-mix(in srgb, ${color.main} 25%, transparent)`,
    }),
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
