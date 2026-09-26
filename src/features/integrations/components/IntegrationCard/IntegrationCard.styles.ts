import { Box, Card } from '@mui/material'
import { styled } from '@mui/material/styles'

// El Card del tema ya trae borde, sombra y radio: acá sólo el layout interno.
export const CardRoot = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '100%',
}))

export const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
}))

// La configuración de la cuenta (dominio, ubicación...) en una lista compacta.
export const SettingsList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: 0,
  '& > *': { overflowWrap: 'anywhere' },
}))

export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: 'auto',
}))
