import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

export const FieldRoot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

// El DS pone el label arriba del input, no flotando en el notch de MUI.
export const FieldLabel = styled(Typography)(({ theme }) => ({
  color: theme.vars.palette.text.secondary,
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

// El asterisco de obligatorio, en el color de error como es costumbre: es lo
// que, si falta, termina siendo un error.
export const RequiredMarkRoot = styled('span')(({ theme }) => ({
  color: theme.vars.palette.error.main,
  marginLeft: theme.spacing(0.25),
}))
