import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ProgressTone } from 'shared/components'

const TRANSIENT_PROPS = new Set<string>(['tone'])

export const ServiceCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
}))

export const CardHeading = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

// Una fila por operador: rótulo y porcentaje arriba, la barra debajo. Es una
// lista porque el orden (de mejor a peor) es información.
export const CarrierList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  margin: 0,
  padding: 0,
  listStyle: 'none',
}))

export const CarrierRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}))

export const CarrierHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
}))

// El porcentaje toma el color del tono, con su ícono al lado: nunca color solo
// (regla de los semánticos del DS).
export const CarrierRate = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<{ tone: ProgressTone }>(({ theme, tone }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  color: theme.vars.palette[tone].main,
  '& > svg': { fontSize: theme.typography.bodyMd.fontSize },
}))

export const RateValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.dataMono,
  color: 'inherit',
}))
