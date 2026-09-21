import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// `wrap` para que en pantallas angostas las acciones caigan abajo en vez de
// comprimir el título, como en el resto de los encabezados.
export const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}))

export const Heading = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}))

export const TitleLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}))

export const Actions = styled(Box)(({ theme }) => ({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}))
