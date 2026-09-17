import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// Ver `InfoPanel.styles.ts`: `component` en un `styled(Card)` necesita el tipo.
interface AsProp {
  component?: ElementType
}

export const SummaryCard = styled(Card)<AsProp>(({ theme }) => ({
  padding: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}))

// Rótulo a la izquierda y monto a la derecha, sobre la misma línea de base.
export const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(2),
  '& > :last-child': { marginLeft: 'auto', textAlign: 'right' },
}))

interface AmountProps {
  pending: boolean
}

const TRANSIENT_PROPS = new Set<string>(['pending'])

export const Amount = styled(Typography, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<AmountProps>(({ theme, pending }) => ({
  color: pending ? theme.palette.text.disabled : theme.palette.text.primary,
}))

// Rótulo del total: tamaño de `bodyLg` con el peso de `labelMd`, como en S08.
export const TotalLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLg,
  fontWeight: theme.typography.labelMd.fontWeight,
}))

// El total de S08: 20px bold en monoespaciada y en el color de acción. Toma el
// tamaño del `h2` y la familia de `dataMono`.
export const TotalAmount = styled(Typography)(({ theme }) => ({
  ...theme.typography.h2,
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.palette.primary.main,
}))
