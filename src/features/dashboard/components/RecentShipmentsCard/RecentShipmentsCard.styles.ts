import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'

// Misma geometría que tenía la tarjeta de Integraciones, a la que reemplaza
// (TESIS-163): la columna de la derecha del panel no cambia de forma.
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

export const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& > svg': { marginLeft: 'auto', color: theme.vars.palette.text.secondary, display: 'block' },
}))

export const ShipmentRows = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const ShipmentRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}))

// La fila entera lleva a la orden, que es donde vive el detalle del envío. Es
// un `Link` envolviendo y no un `component` en la fila: así el skeleton usa la
// misma fila sin arrastrar un destino que todavía no existe.
export const RowLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  borderRadius: theme.shape.borderRadius,
  '&:hover': { backgroundColor: theme.alpha(theme.vars.palette.text.primary, 0.04) },
  '&:focus-visible': {
    outline: `2px solid ${theme.vars.palette.primary.main}`,
    outlineOffset: 2,
  },
}))

export const ShipmentTile = styled(Box)(({ theme }) => ({
  width: SERVICE_TILE.size,
  height: SERVICE_TILE.size,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.containerHighest,
  color: theme.vars.palette.text.secondary,
  '& svg': { fontSize: SERVICE_TILE.iconSize, display: 'block' },
}))

// `minWidth: 0` para que el operador largo se recorte en vez de empujar el
// estado fuera de la tarjeta.
export const ShipmentIdentity = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  minWidth: 0,
})

export const CourierName = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.labelMd.fontWeight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

// El seguimiento va en monoespaciada: es un código que se compara carácter a
// carácter contra el que muestra el courier.
export const TrackingLine = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.vars.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))
