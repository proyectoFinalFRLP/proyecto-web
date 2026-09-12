import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// Geometría de la fila, tomada de `S03-Panel`: tile de 32px con radio 8 y un
// ícono de 18px adentro.
const SERVICE_TILE = { size: 32, iconSize: 18 }

// Filas fantasma del estado de carga. Ids fijos y no índices: `react/no-array-index-key`.
export const SKELETON_ROWS = ['first', 'second', 'third']

export const SKELETON_TILE = SERVICE_TILE.size

// El Card del tema ya trae borde/sombra/radio — acá solo layout.
export const ListCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '100%',
}))

// El ícono `hub` del diseño va al extremo derecho de la cabecera.
export const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& > svg': { marginLeft: 'auto', color: theme.palette.text.secondary, display: 'block' },
}))

export const NodeRows = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const NodeRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}))

// Tile de identidad del servicio. Superficie tonal del tema, no un color crudo.
export const ServiceTile = styled(Box)(({ theme }) => ({
  width: SERVICE_TILE.size,
  height: SERVICE_TILE.size,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.containerHighest,
  color: theme.palette.text.secondary,
  '& svg': { fontSize: SERVICE_TILE.iconSize, display: 'block' },
}))

// `minWidth: 0` para que el nombre largo se recorte en vez de empujar el ícono
// de estado fuera de la tarjeta.
export const NodeIdentity = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  minWidth: 0,
})

// El diseño pide el nombre en 14px semibold: el tamaño sale de `bodyMd` y el
// peso de `labelMd`, así ningún número queda escrito acá.
export const NodeName = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.labelMd.fontWeight,
  // El nombre sí se recorta: es reconocible por el prefijo y no puede robarle
  // alto a la fila.
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

interface SyncLineProps {
  degraded: boolean
}

const TRANSIENT_PROPS = new Set<string>(['degraded'])

// Línea de sincronización: tamaño de `labelSm` con la familia monoespaciada de
// `dataMono`, como en el diseño. En rojo cuando la sync quedó atrasada.
export const SyncLine = styled(Typography, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<SyncLineProps>(({ theme, degraded }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
  color: degraded ? theme.palette.error.main : theme.palette.text.secondary,
  // A diferencia del nombre, esta línea NO se recorta: el tiempo transcurrido
  // vive al final de la frase, y truncarlo sería perder justamente el dato que
  // la fila existe para mostrar. En una columna angosta envuelve a dos renglones.
}))
