import { Box, Card } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// Ver `InfoPanel.styles.ts`: `component` en un `styled(Card)` necesita el tipo.
interface AsProp {
  component?: ElementType
}

export const SectionCard = styled(Card)<AsProp>(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

// Ícono en el color de acción y título `h3`, como el encabezado de sección de S05.
export const SectionHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& > svg': { color: theme.palette.primary.main, fontSize: 20 },
}))

// Dos columnas en el diseño; una sola cuando no entran.
export const FieldsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}))
