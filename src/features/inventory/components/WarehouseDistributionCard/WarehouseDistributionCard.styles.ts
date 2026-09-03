import { Box, Card, TableCell, TableContainer, TableRow, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

// Alto de fila de S12. `minHeight` y no `height`: la celda del depósito lleva
// dos renglones y no puede quedar recortada al angostarse.
const ROW_HEIGHT = 52
// Grosor de la barra de acento de la fila resaltada.
const ROW_ACCENT_WIDTH = 3
// Ancho mínimo de la columna de depósito. Sin esto, en pantallas angostas el
// nombre se parte en dos renglones ("CD / Córdoba") aunque la tabla ya tenga su
// propio scroll horizontal para no comprimirse.
const WAREHOUSE_COLUMN_MIN_WIDTH = 160

export const DistributionCard = styled(Card)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
})

// Cabecera de la tarjeta: mismo alto y separador que el DataTable del diseño.
export const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(0, 2),
  minHeight: 48,
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

// La tabla desborda a lo ancho antes que comprimir las columnas numéricas: en
// pantallas angostas se scrollea sola en vez de romper la maqueta de la página.
export const TableScroll = styled(TableContainer)({
  flex: '1 1 auto',
})

export const HeadCell = styled(TableCell)(({ theme }) => ({
  ...theme.typography.labelCaps,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.layer.floor,
  borderBottom: `1px solid ${theme.palette.divider}`,
  whiteSpace: 'nowrap',
}))

interface BodyRowProps {
  critical: boolean
}

const TRANSIENT_PROPS = new Set<string>(['critical'])

// La fila crítica se marca con relleno y barra de acento, nunca sólo con color:
// el badge de estado sigue siendo el que nombra la condición.
export const BodyRow = styled(TableRow, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<BodyRowProps>(({ theme, critical }) => ({
  minHeight: ROW_HEIGHT,
  ...(critical
    ? {
        // Tinte más liviano que `error.container`: ese tono es justamente el
        // fondo del badge, y con los dos iguales el badge desaparecía dentro de
        // la fila en tema claro.
        backgroundColor: alpha(theme.palette.error.main, 0.08),
        // La primera celda es un `th` (encabezado de fila), así que el
        // selector no puede ser `td:first-of-type`.
        '& > :first-child': {
          boxShadow: `inset ${ROW_ACCENT_WIDTH}px 0 0 ${theme.palette.error.main}`,
        },
      }
    : {}),
  '&:last-of-type > td': { borderBottom: 'none' },
}))

export const BodyCell = styled(TableCell)(({ theme }) => ({
  ...theme.typography.bodyMd,
  height: ROW_HEIGHT,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

// Celdas numéricas: monoespaciada y alineadas a la derecha, como en el diseño.
export const NumberCell = styled(BodyCell)(({ theme }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
  fontWeight: theme.typography.dataMono.fontWeight,
  whiteSpace: 'nowrap',
}))

// La cantidad en depósito es el número que la fila existe para mostrar: va con
// el peso de los datos destacados.
export const StrongNumberCell = styled(NumberCell)(({ theme }) => ({
  fontWeight: theme.typography.labelMd.fontWeight,
}))

// Columna sin dato: se atenúa para que no compita con las cantidades reales.
export const MutedNumberCell = styled(NumberCell)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

// La celda de identidad del depósito: nombre arriba, ubicación abajo.
export const WarehouseCell = styled(BodyCell)({
  minWidth: WAREHOUSE_COLUMN_MIN_WIDTH,
})

export const WarehouseName = styled(Typography)({
  overflowWrap: 'anywhere',
})

export const WarehouseLocation = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  overflowWrap: 'anywhere',
}))

// Pie de la tarjeta, con el mismo alto que el del DataTable del diseño.
export const CardFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  padding: theme.spacing(1.5, 2),
  minHeight: 56,
  borderTop: `1px solid ${theme.palette.divider}`,
}))

export const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2),
}))
