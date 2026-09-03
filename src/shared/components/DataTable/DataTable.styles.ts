import { Box, TableCell, TableContainer, TableRow, Tab } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

import type { DataTableRowTone } from './DataTable.types'

// Alto de fila del diseño (padding vertical 22.5px sobre contenido de 21px).
export const ROW_HEIGHT = 66

// Ancho de la columna de selección — el checkbox más su padding de 24px.
export const SELECT_COLUMN_WIDTH = 64

const TRANSIENT = new Set<string>(['tone'])

// La tarjeta es la superficie elevada; las bandas (barra, encabezado y pie) van
// sobre el fondo de página, más hundido. En el frame la relación está invertida
// —tarjeta más oscura que la página— porque viene de otra generación de la
// paleta; acá se respeta la del DS, que sube la superficie de contenido.
export const TableCard = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  // La tarjeta nunca es más ancha que su hueco: el desborde lo absorbe el
  // Scroller de adentro. Sin esto la tabla empuja el layout hacia afuera.
  maxWidth: '100%',
  backgroundColor: theme.palette.background.paper,
  border: theme.elevation[1].border,
  boxShadow: theme.elevation[1].boxShadow,
}))

export const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingInline: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingBlock: theme.spacing(1),
  },
}))

export const ToolbarActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  flexShrink: 0,
  paddingBlock: theme.spacing(1),
}))

// Pestaña del diseño: versalitas chicas con subrayado de acento en la activa.
export const FilterTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  minWidth: 0,
  paddingInline: theme.spacing(1),
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  '&.Mui-selected': { color: theme.palette.primary.main },
}))

// El scroll horizontal es la salida en pantallas angostas: una tabla de 7
// columnas no colapsa a una sola sin dejar de ser una tabla. El scroll vive
// acá y no en la página — `maxWidth` es lo que lo mantiene adentro.
export const Scroller = styled(TableContainer)({
  width: '100%',
  maxWidth: '100%',
  overflowX: 'auto',
})

export const HeadCell = styled(TableCell)(({ theme }) => ({
  paddingBlock: theme.spacing(1.5),
  paddingInline: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}))

interface BodyRowProps {
  tone: DataTableRowTone
}

export const BodyRow = styled(TableRow, {
  shouldForwardProp: (prop) => !TRANSIENT.has(prop as string),
})<BodyRowProps>(({ theme, tone }) => ({
  height: ROW_HEIGHT,
  transition: theme.transitions.create('background-color'),
  '&:hover': { backgroundColor: theme.palette.background.containerHighest },
  // El tinte de la fila crítica tiene que sobrevivir al hover, si no la fila
  // pierde su marca justo cuando el usuario la está por tocar.
  ...(tone === 'critical' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.16) },
  }),
  ...(tone === 'muted' && { opacity: 0.8 }),
}))

export const BodyCell = styled(TableCell)(({ theme }) => ({
  paddingBlock: theme.spacing(2),
  paddingInline: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  fontSize: 14,
}))

// Celda de selección: ancho fijo y sin el padding lateral del resto, para que
// el checkbox quede alineado con el del encabezado.
export const SelectCell = styled(BodyCell)(({ theme }) => ({
  width: SELECT_COLUMN_WIDTH,
  paddingInline: theme.spacing(3),
}))

export const PaginationBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}))

export const PageButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexShrink: 0,
}))

export const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))
