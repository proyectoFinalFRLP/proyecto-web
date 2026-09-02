import { Box, Button } from '@mui/material'
import { styled } from '@mui/material/styles'

// El shell (root, header, form, body, footer, campos) viene de
// `ProductModalShell`. Acá quedan las piezas propias del alta.
//
// El encabezado de sección de este frame es distinto al de la edición: ícono en
// un recuadro tintado en vez de la barra de acento. Es la versión v2 del
// diseño, la que usa nuestros tokens tal cual.

// Lado del recuadro del ícono de sección y de su glifo.
export const SECTION_ICON_BOX = 32
export const SECTION_ICON_GLYPH = 16

// Ancho de la columna de cantidad, fijo para que las filas queden alineadas.
const QUANTITY_COLUMN = 128

export const SectionRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}))

export const SectionHeadingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}))

export const SectionIconBox = styled(Box)(({ theme }) => ({
  width: SECTION_ICON_BOX,
  height: SECTION_ICON_BOX,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  backgroundColor: theme.palette.secondary.container,
  color: theme.palette.secondary.main,
  '& svg': { display: 'block', fontSize: SECTION_ICON_GLYPH },
}))

// Empuja la acción de la sección contra el borde derecho.
export const SectionAction = styled(Box)({
  marginLeft: 'auto',
})

// ── Grillas ──────────────────────────────────────────────────────────────────

export const BasicGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}))

// Peso ocupa un tercio y las medidas los dos restantes, como en el frame.
export const SpecGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}))

export const SpecDimensions = styled(Box)(({ theme }) => ({
  gridColumn: 'span 2',
  [theme.breakpoints.down('sm')]: { gridColumn: 'auto' },
}))

// Los tres ejes con el "×" entre medio, bajo un único label.
export const DimensionsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& input': { textAlign: 'center' },
}))

export const DimensionsSeparator = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontSize: 12,
  lineHeight: 1,
  userSelect: 'none',
}))

// ── Filas de stock inicial ───────────────────────────────────────────────────

export const StockList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}))

export const StockRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(3),
  padding: theme.spacing(2.5),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  // Superficie recesada, igual que el relleno de los inputs del DS.
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}))

export const StockWarehouse = styled(Box)({
  flex: '1 1 0',
  minWidth: 0,
})

export const StockQuantity = styled(Box)(({ theme }) => ({
  width: QUANTITY_COLUMN,
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: { width: '100%' },
}))

export const AddWarehouseButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  borderRadius: 8,
  paddingInline: theme.spacing(1.5),
  paddingBlock: theme.spacing(0.75),
  border: `1px solid color-mix(in srgb, ${theme.palette.secondary.main} 20%, transparent)`,
  color: theme.palette.secondary.main,
  fontSize: 12,
  fontWeight: 700,
  '&:hover': {
    backgroundColor: `color-mix(in srgb, ${theme.palette.secondary.main} 10%, transparent)`,
  },
}))
