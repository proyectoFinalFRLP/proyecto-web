import { Box, Card } from '@mui/material'
import { styled } from '@mui/material/styles'

import type { StatCardProps } from './StatCard.types'

// Tamaño fijo del skeleton del valor, para no hardcodear números en el .tsx.
export const VALUE_SKELETON = { width: 96, height: 40 }

// Tile del ícono: mismo alto que el skeleton del valor. Valores en px.
const ICON_TILE = { size: 40, iconSize: 20 }

// El Card del tema ya trae borde/sombra/radio (elevation nivel 1) — acá solo layout.
export const CardRoot = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '100%',
}))

// Label + valor van pegados entre sí y separados del resto: el ojo los lee como
// una sola unidad (qué se mide / cuánto da).
export const MetricBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}))

interface IconWrapProps {
  tone: NonNullable<StatCardProps['tone']>
}

const TRANSIENT_PROPS = new Set<string>(['tone'])

// Fondo = tono `container`, ícono = `main` en dark / `onContainer` en light. Fiel al DS.
export const IconWrap = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<IconWrapProps>(({ theme, tone }) => {
  const color = theme.palette[tone]
  const isDark = theme.palette.mode === 'dark'

  return {
    width: ICON_TILE.size,
    height: ICON_TILE.size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Radio base del tema (8px): no hay escala de radios expuesta en el theme y
    // `features` no puede importar los tokens de `app/`.
    borderRadius: theme.shape.borderRadius,
    backgroundColor: color.container,
    color: isDark ? color.main : color.onContainer,
    '& svg': { fontSize: ICON_TILE.iconSize, display: 'block' },
  }
})
