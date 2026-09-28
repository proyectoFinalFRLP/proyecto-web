import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// Ver `InfoPanel.styles.ts`: `component` en un `styled(Card)` necesita el tipo.
interface AsProp {
  component?: ElementType
}

// La tarjeta de totales de S05: dos métricas lado a lado, cada una con su
// rótulo y su aclaración a la izquierda y el número a la derecha.
export const SummaryRoot = styled(Card)<AsProp>(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}))

export const Metric = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 3),
  minWidth: 0,
  // Separador entre las dos métricas: vertical lado a lado, horizontal apiladas.
  '& + &': {
    borderLeft: `1px solid ${theme.vars.palette.divider}`,
    [theme.breakpoints.down('md')]: {
      borderLeft: 'none',
      borderTop: `1px solid ${theme.vars.palette.divider}`,
    },
  },
}))

export const MetricText = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  minWidth: 0,
}))

interface MetricValueProps {
  emphasis: 'primary' | 'secondary'
}

const TRANSIENT_PROPS = new Set<string>(['emphasis'])

// El número grande de S05 (32px, monoespaciada). El subtotal va en el color de
// acción, que es el dato que decide la venta; el peso, en texto primario.
export const MetricValue = styled(Typography, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<MetricValueProps>(({ theme, emphasis }) => ({
  ...theme.typography.displaySm,
  fontFamily: theme.typography.dataMono.fontFamily,
  marginLeft: 'auto',
  whiteSpace: 'nowrap',
  color: emphasis === 'primary' ? theme.vars.palette.primary.main : theme.vars.palette.text.primary,
}))
