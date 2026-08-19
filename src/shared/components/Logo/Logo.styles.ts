import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// Reglas de marca del diseño, en px.
//
// `MIN_WIDTH` es el mínimo para web que fija el manual (140px). Se aplica como
// `minWidth` del lockup completo: por debajo de eso el isotipo y la bajada
// dejan de ser legibles.
//
// `CLEARANCE` es el área de respeto: el manual la define como "1× la altura de
// la 'P'". La altura de mayúscula de Plus Jakarta Sans es ~0.73em, así que a
// 36px del wordmark son ~26px. Va como padding del lockup, no del contenedor,
// para que la regla viaje con el logo a donde se use.
const MIN_WIDTH = 140
const CLEARANCE = 26
const MARK_BOX = 80
const CROP_MARK = 8

export const LogoRoot = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  minWidth: MIN_WIDTH,
  padding: CLEARANCE,
}))

// Caja del isotipo: relleno tenue del acento, borde de 2px y marcas de recorte
// en las cuatro esquinas, como en el manual.
export const MarkBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  flexShrink: 0,
  width: MARK_BOX,
  height: MARK_BOX,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  backgroundColor: `color-mix(in srgb, ${theme.palette.secondary.main} 20%, transparent)`,
  border: `2px solid ${theme.palette.secondary.main}`,
  color: theme.palette.secondary.main,
}))

export const CropMark = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'corner',
})<{ corner: 'tl' | 'tr' | 'bl' | 'br' }>(({ theme, corner }) => ({
  position: 'absolute',
  width: CROP_MARK,
  height: CROP_MARK,
  backgroundColor: theme.palette.secondary.main,
  pointerEvents: 'none',
  ...(corner === 'tl' && { top: -CROP_MARK / 2, left: -CROP_MARK / 2 }),
  ...(corner === 'tr' && { top: -CROP_MARK / 2, right: -CROP_MARK / 2 }),
  ...(corner === 'bl' && { bottom: -CROP_MARK / 2, left: -CROP_MARK / 2 }),
  ...(corner === 'br' && { bottom: -CROP_MARK / 2, right: -CROP_MARK / 2 }),
}))

// El wordmark aprieta el tracking y sube el peso por encima de `displaySm`:
// son ajustes de marca del manual, no de la escala tipográfica, y por eso
// viven acá y no en el tema.
export const BrandName = styled(Typography)({
  fontWeight: 800,
  letterSpacing: '-0.05em',
  textTransform: 'uppercase',
})

// La bajada hace lo contrario: abre el tracking para que "LOGISTICS" ocupe el
// ancho del wordmark.
export const TaglineText = styled(Typography)({
  fontWeight: 700,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
})

export const Wordmark = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
})

// Fila de la bajada: una regla que ocupa el espacio libre y el texto espaciado.
export const TaglineRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

export const TaglineRule = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 8,
  height: 2,
  backgroundColor: `color-mix(in srgb, ${theme.palette.secondary.main} 40%, transparent)`,
}))
