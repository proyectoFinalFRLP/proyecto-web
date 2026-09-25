import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// Ver `InfoPanel.styles.ts`: `component` en un `styled(Card)` necesita el tipo.
interface AsProp {
  component?: ElementType
}

export const ConfirmCardRoot = styled(Card)<AsProp>(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const SummaryLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(2),
  '& > :last-child': { marginLeft: 'auto', textAlign: 'right' },
}))

// El total final de S07: el número más grande de la pantalla, en el color de
// acción y en la familia de los datos, como el subtotal del paso 1.
export const TotalValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.displaySm,
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.palette.primary.main,
  whiteSpace: 'nowrap',
}))
