import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// Ver la nota en `ProductDetailHeader.styles.ts`: `styled(Typography)` necesita
// que se le declare `component`, y `as` no lo reemplaza.
interface AsProp {
  component?: ElementType
}

// Alto de la fila de cubeta, tomado de S12.
const BUCKET_ROW_HEIGHT = 52

export const StockCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '100%',
}))

export const CardHeading = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
})

// El total y su unidad comparten línea de base, como en el diseño.
export const TotalRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}))

// El número grande va en la familia monoespaciada: es un dato, no un título.
export const TotalValue = styled(Typography)<AsProp>(({ theme }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
}))

export const BucketList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}))

interface BucketRowProps {
  accent: boolean
}

const TRANSIENT_PROPS = new Set<string>(['accent'])

// Fila recesada respecto de la card (relleno de input del DS). La cubeta
// destacada suma el borde punteado y el color de acción del diseño.
export const BucketRow = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<BucketRowProps>(({ theme, accent }) => ({
  boxSizing: 'border-box',
  minHeight: BUCKET_ROW_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(0, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.layer.floor,
  border: accent
    ? `1px dashed ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  '& > svg': { display: 'block', flexShrink: 0 },
}))

interface BucketTextProps {
  emphasis: boolean
}

const TEXT_TRANSIENT_PROPS = new Set<string>(['emphasis'])

export const BucketLabel = styled(Typography, {
  shouldForwardProp: (prop) => !TEXT_TRANSIENT_PROPS.has(prop as string),
})<BucketTextProps>(({ theme, emphasis }) => ({
  color: emphasis ? theme.palette.text.primary : theme.palette.text.secondary,
  minWidth: 0,
}))

// El valor se ancla a la derecha y va en monoespaciada, como el resto de las
// cantidades de la pantalla.
export const BucketValue = styled(Typography, {
  shouldForwardProp: (prop) => !TEXT_TRANSIENT_PROPS.has(prop as string),
})<BucketTextProps>(({ theme, emphasis }) => ({
  marginLeft: 'auto',
  fontFamily: theme.typography.dataMono.fontFamily,
  color: emphasis ? theme.palette.primary.main : theme.palette.text.primary,
}))

// El botón queda pegado al pie de la card aunque el desglose sea corto.
export const CardFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(1),
}))
