import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

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
