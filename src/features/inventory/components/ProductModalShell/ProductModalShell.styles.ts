import { Box, Dialog, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// Estructura compartida por los modales de producto (alta y edición). Se extrajo
// acá cuando apareció el segundo consumidor — la "Regla de Dos" de
// feature-structure.md §6 — en vez de duplicar el shell en cada modal.
//
// Lo que NO vive acá es el encabezado de sección: cada frame de Figma tiene el
// suyo (barra de acento en el de edición, ícono en recuadro en el de alta), así
// que cada modal aporta el propio.

export const MODAL_MAX_WIDTH = 672

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

// ── Campos ───────────────────────────────────────────────────────────────────

export const FieldRoot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

// El DS pone el label arriba del input, no flotando en el notch de MUI.
export const FieldLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  fontWeight: 700,
  textTransform: 'uppercase',
}))

// Ocupa la fila completa de una grilla; hereda de FieldRoot para comportarse
// igual que cualquier otro campo.
export const FullRow = styled(FieldRoot)(({ theme }) => ({
  gridColumn: '1 / -1',
  [theme.breakpoints.down('sm')]: { gridColumn: 'auto' },
}))
