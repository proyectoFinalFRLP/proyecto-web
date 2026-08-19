import { Box, Button, Dialog, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// Ancho del modal en el frame de Figma. Por debajo de esa medida el diálogo
// pasa a ocupar el ancho disponible.
export const MODAL_MAX_WIDTH = 672

// Radios (px). No se leen del tema ni de `tokens.ts`: `shape.borderRadius` es
// el radio base (8) de los controles, y las reglas de capa prohíben que una
// feature importe de `app/` (architecture.md §3.2). Mismo criterio que
// `StatCard.styles.ts`. Los valores son `radius.md` y `radius.base` del DS.
const ROW_RADIUS = 12
const ICON_RADIUS = 8

// Lado del recuadro del ícono de depósito y de su glifo interno.
export const WAREHOUSE_ICON_BOX = 40
export const WAREHOUSE_ICON_GLYPH = 20

// Ancho de la columna de cantidad. Fijo para que los inputs de todas las filas
// queden alineados aunque los nombres de depósito midan distinto.
const QUANTITY_COLUMN = 128

export const ModalRoot = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    maxHeight: `calc(100% - ${theme.spacing(8)})`,
    margin: theme.spacing(2),
    // El paper no scrollea (MUI le pone `overflow-y: auto` por defecto): el
    // único que scrollea es el cuerpo, así el título y las acciones quedan
    // siempre a la vista, como en el diseño.
    overflow: 'hidden',
  },
}))

// El `<form>` envuelve cuerpo y pie, así que tiene que ser la columna flex que
// reparte el alto. Si queda como bloque suelto, el `overflow` del cuerpo no
// tiene contra qué medirse y termina scrolleando el modal entero.
export const ModalForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 auto',
  minHeight: 0,
})

export const ModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
}))

export const ModalBody = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  padding: theme.spacing(3),
  // `minHeight: 0` es load-bearing: sin eso un ítem flex no baja de su tamaño
  // de contenido y el scroll nunca se activa.
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
}))

export const ModalFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  flexShrink: 0,
  // En pantallas chicas el pie apila la leyenda sobre los botones.
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}))

export const FooterActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: { justifyContent: 'flex-end' },
}))

// ── Secciones ────────────────────────────────────────────────────────────────

export const SectionRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const SectionHeadingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}))

export const SectionTitleGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

export const SectionTitle = styled(Typography)({
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

// Barra vertical de acento a la izquierda del título de sección.
export const SectionBar = styled(Box)(({ theme }) => ({
  width: 4,
  height: 20,
  flexShrink: 0,
  borderRadius: 9999,
  backgroundColor: theme.palette.primary.main,
}))

// ── Campos ───────────────────────────────────────────────────────────────────

// El DS pone el label arriba del input, no flotando en el notch de MUI.
export const FieldLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}))

export const FieldRoot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

export const BasicGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}))

// El nombre del producto ocupa la fila entera; SKU y categoría se reparten la
// siguiente. Hereda de FieldRoot para que ambos se comporten igual como campo.
export const FullRow = styled(FieldRoot)(({ theme }) => ({
  gridColumn: '1 / -1',
  [theme.breakpoints.down('sm')]: { gridColumn: 'auto' },
}))

export const SpecGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}))

// ── Asignación de stock ──────────────────────────────────────────────────────

export const WarehouseList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}))

export const WarehouseRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: ROW_RADIUS,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
    // El ícono se va en mobile: la fila ya se identifica por el nombre y ese
    // ancho hace falta para la cantidad.
    '& > :first-of-type': { display: 'none' },
  },
}))

export const WarehouseIconBox = styled(Box)(({ theme }) => ({
  width: WAREHOUSE_ICON_BOX,
  height: WAREHOUSE_ICON_BOX,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: ICON_RADIUS,
  backgroundColor: theme.palette.primary.container,
  color: theme.palette.primary.main,
  '& svg': { display: 'block', fontSize: WAREHOUSE_ICON_GLYPH },
}))

export const WarehouseInfo = styled(Box)({
  flex: '1 1 0',
  minWidth: 0,
})

export const WarehouseName = styled(Typography)({
  fontWeight: 600,
})

// La dirección baja el peso de `labelMd` (600) para que el nombre del depósito
// mande en la fila.
export const WarehouseAddress = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 400,
}))

export const QuantityLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  marginBottom: theme.spacing(0.5),
  fontWeight: 700,
  textTransform: 'uppercase',
}))

export const QuantityError = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color: theme.palette.error.main,
}))

export const QuantityField = styled(Box)(({ theme }) => ({
  width: QUANTITY_COLUMN,
  flexShrink: 0,
  // La cantidad va alineada a la derecha: son números que se comparan de a
  // muchos entre filas.
  '& input': { textAlign: 'right' },
  [theme.breakpoints.down('sm')]: { width: 'auto', flex: '1 1 0' },
}))

export const AddWarehouseButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  borderRadius: 9999,
  paddingInline: theme.spacing(1.5),
  paddingBlock: theme.spacing(0.75),
  backgroundColor: theme.palette.primary.container,
  color: theme.palette.primary.main,
  fontSize: 12,
  fontWeight: 700,
  '&:hover': {
    backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 20%, transparent)`,
  },
}))
