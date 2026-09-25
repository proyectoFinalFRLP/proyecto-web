import { Box, Dialog, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import type { ModalSize } from './ModalFrame.types'

// `md` es el ancho del ModalFrame del diseño (672), el de los formularios. `sm`
// es para una pregunta: una confirmación de dos líneas a 672 queda en un renglón
// larguísimo, con los botones lejos de lo que confirman. `lg` es para cuando el
// cuerpo trae una tabla o un resumen que necesita columnas.
const MODAL_WIDTHS: Record<ModalSize, number> = {
  sm: 480,
  md: 672,
  lg: 880,
}

export const ModalRoot = styled(Dialog, {
  shouldForwardProp: (prop) => prop !== 'modalSize',
})<{ modalSize: ModalSize }>(({ theme, modalSize }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: MODAL_WIDTHS[modalSize],
    maxHeight: `calc(100% - ${theme.spacing(8)})`,
    margin: theme.spacing(2),
    // El paper no scrollea (MUI le pone `overflow-y: auto` por defecto): el
    // único que scrollea es el cuerpo, así el título y las acciones quedan
    // siempre a la vista, como en el diseño.
    overflow: 'hidden',
  },
}))

export const ModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(3, 3, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
}))

export const ModalHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  flex: 1,
  minWidth: 0,
}))

// Cuando el modal es un formulario, el `<form>` envuelve cuerpo y pie, así que
// tiene que ser la columna flex que reparte el alto. Si queda como bloque
// suelto, el `overflow` del cuerpo no tiene contra qué medirse y termina
// scrolleando el modal entero.
export const ModalForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 auto',
  minHeight: 0,
})

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
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  flexShrink: 0,
  // En pantallas chicas el pie apila la nota sobre los botones.
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}))

// Texto del pie a la izquierda de las acciones ("Actualizado hace 2 horas").
export const ModalFooterNote = styled(Typography)(({ theme }) => ({
  marginRight: 'auto',
  color: theme.palette.text.secondary,
  [theme.breakpoints.down('sm')]: { marginRight: 0 },
}))

export const ModalFooterActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexShrink: 0,
  // En pantallas chicas los botones van a lo ancho, con la acción principal
  // arriba, como apila Material las acciones de un diálogo.
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column-reverse',
    alignItems: 'stretch',
  },
}))
