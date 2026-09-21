import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// Filas fantasma del estado de carga. Ids fijos y no índices: `react/no-array-index-key`.
export const SKELETON_ROWS = ['first', 'second', 'third']

// El Card del tema ya trae borde, sombra y radio — acá sólo el layout, igual
// que en `IntegrationNodeList`, que es la otra tarjeta de esta columna.
export const LoadCard = styled(Card)(({ theme }) => ({
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
  '& > svg': { marginLeft: 'auto', color: theme.palette.text.secondary, display: 'block' },
}))

export const Rows = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}))

// El nombre a la izquierda y las unidades a la derecha, sobre la barra.
export const RowHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(1),
  '& > :last-of-type': { marginLeft: 'auto' },
}))

// El nombre del depósito se recorta antes que empujar las unidades fuera de la
// tarjeta: la columna del panel mide 280px y los nombres pueden ser largos.
export const WarehouseName = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
})

// Las unidades en la monoespaciada del DS, como cualquier número de la pantalla.
export const StoredUnits = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
}))
