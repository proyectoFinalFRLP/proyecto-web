import { Box, Card } from '@mui/material'
import { styled } from '@mui/material/styles'

// Tamaño del círculo fantasma que ocupa el lugar del LED mientras carga.
export const LED_SKELETON_SIZE = 10

// Filas fantasma del estado de carga. Ids fijos y no índices: `react/no-array-index-key`.
export const SKELETON_ROWS = ['first', 'second', 'third']

// El Card del tema ya trae borde/sombra/radio — acá solo layout.
export const ListCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '100%',
}))

export const HeaderBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}))

// Separador entre filas en lugar de borde por fila: no hay línea colgando arriba
// de la primera ni abajo de la última.
export const NodeRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  '& + &': { borderTop: `1px solid ${theme.palette.divider}` },
}))

// `minWidth: 0` para que el nombre largo pueda recortarse en vez de empujar el
// timestamp fuera de la tarjeta.
export const NodeIdentity = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  minWidth: 0,
})

export const NodeName = styled(Box)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
