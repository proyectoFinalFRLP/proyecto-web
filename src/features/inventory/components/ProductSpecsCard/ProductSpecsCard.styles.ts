import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// El Card del tema ya trae borde, sombra y radio: acá sólo el layout interno.
export const SpecsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const CardHeading = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
})

// Cuatro columnas en escritorio. `auto-fit` con un mínimo evita el media query:
// la grilla se reacomoda sola a 2 y a 1 columna al angostarse.
export const SpecsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: theme.spacing(2),
}))

// Misma grilla, pero sin estirar las celdas: la fila de abajo del divisor son
// dos datos juntos a la izquierda, no dos columnas repartidas.
export const SecondaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(4),
}))

export const SpecItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: 0,
}))

export const SpecLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

interface SpecValueProps {
  mono: boolean
  unknown: boolean
}

const TRANSIENT_PROPS = new Set<string>(['mono', 'unknown'])

// El valor va en 16px semibold (tamaño de `bodyLg`, peso de `labelMd`), en la
// familia monoespaciada cuando es un número.
export const SpecValue = styled(Typography, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<SpecValueProps>(({ theme, mono, unknown }) => ({
  fontWeight: theme.typography.labelMd.fontWeight,
  color: unknown ? theme.palette.text.secondary : theme.palette.text.primary,
  ...(mono ? { fontFamily: theme.typography.dataMono.fontFamily } : {}),
  overflowWrap: 'anywhere',
}))
