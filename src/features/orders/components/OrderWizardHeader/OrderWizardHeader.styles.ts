import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

export const HeaderRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}))

// Título, etapa y contador sobre la misma línea de base, como en S05. En
// pantallas angostas el contador baja a su propia línea.
export const TitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}))

export const StepCounter = styled(Typography)(({ theme }) => ({
  marginLeft: 'auto',
  color: theme.palette.primary.main,
}))
