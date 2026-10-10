import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// El botón y lo que le falta, apilados y contra el borde derecho de la fila de
// acciones del asistente. `margin-left: auto` es lo que antes llevaba el botón
// suelto (TESIS-132); ahora lo lleva el bloque entero.
export const NextRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
  marginLeft: 'auto',
}))

// Alineado con el botón y acotado de ancho: la lista del paso 2 con envío
// puede nombrar cinco cosas, y a lo ancho de la página se leía como un pie.
export const MissingHint = styled(Typography)(({ theme }) => ({
  color: theme.vars.palette.text.secondary,
  textAlign: 'right',
  maxWidth: 360,
}))
