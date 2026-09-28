import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Cada bloque del cuerpo: el rótulo arriba y su contenido abajo. El espacio
// entre bloques lo pone `ModalBody`.
export const DialogSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}))

export const OriginColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}))

export const OriginRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
}))

export const OriginText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
})
