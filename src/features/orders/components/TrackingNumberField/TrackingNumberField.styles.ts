import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

export const Field = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
}))

// El botón de copiar se ancla a la derecha del panel, como en S08.
export const TrackingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& > button': { marginLeft: 'auto' },
}))

// El número va en el color de acción: es lo que el operador viene a buscar.
export const TrackingValue = styled(Typography)(({ theme }) => ({
  color: theme.vars.palette.primary.main,
  overflowWrap: 'anywhere',
}))
