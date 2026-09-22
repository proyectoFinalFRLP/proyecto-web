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

// Ícono en el color de acción y título `h3`, como los encabezados de sección de
// S05 y S06.
export const SectionHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& > svg': { color: theme.palette.primary.main, fontSize: 20 },
}))
