import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { CHART_FRAME } from '../../utils/chart'

// Ancho de la columna de rótulos del eje Y (px), tomado de S14.
const AXIS_WIDTH = 44

// Opacidad del relleno bajo la curva: el área acompaña al trazo sin competir
// con la grilla.
const AREA_OPACITY = 0.14
const LINE_WIDTH = 3

export const CurveCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  minWidth: 0,
}))

export const CardHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  '& > :last-child': { marginLeft: 'auto' },
}))

// Dos columnas (eje Y · lienzo) por dos filas (curva · rótulos del eje X).
export const ChartGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `${AXIS_WIDTH}px minmax(0, 1fr)`,
  gap: theme.spacing(1),
}))

export const AxisColumn = styled(Box)({
  height: CHART_FRAME.height,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
})

export const AxisTick = styled(Typography)(({ theme }) => ({
  ...theme.typography.labelSm,
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.vars.palette.text.secondary,
  whiteSpace: 'nowrap',
}))

// `preserveAspectRatio="none"`: el lienzo se estira al ancho del contenedor y
// el trazo mantiene su grosor gracias a `vector-effect`.
export const ChartSvg = styled('svg')({
  display: 'block',
  width: '100%',
  height: CHART_FRAME.height,
})

export const GridLine = styled('line')(({ theme }) => ({
  stroke: theme.vars.palette.divider,
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
}))

export const AreaPath = styled('path')(({ theme }) => ({
  fill: theme.vars.palette.primary.main,
  opacity: AREA_OPACITY,
}))

export const LinePath = styled('path')(({ theme }) => ({
  fill: 'none',
  stroke: theme.vars.palette.primary.main,
  strokeWidth: LINE_WIDTH,
  strokeLinecap: 'round',
  vectorEffect: 'non-scaling-stroke',
}))

// Lo que reserva cada rótulo del eje X (px): «12/09» en `labelSm` más aire
// para que dos vecinos no se toquen. Con esto se decide cada cuántos días va
// uno (`labelStep`).
export const DAY_LABEL_SLOT = 48

// Los rótulos van posicionados, cada uno sobre su punto, y no en un flex con
// `space-between`: así se puede saltear días sin que los que quedan se corran
// de su lugar, y la fila no aporta ancho propio —con 30 rótulos en línea, la
// tarjeta se estiraba fuera de la pantalla a 800px—. El alto es el de una
// línea de `labelSm`, que los rótulos, al estar posicionados, ya no dan.
export const LabelsRow = styled(Box)(({ theme }) => ({
  ...theme.typography.labelSm,
  gridColumn: 2,
  position: 'relative',
  height: `${theme.typography.labelSm.lineHeight}em`,
}))

/** Dónde se ancla un rótulo contra su punto. */
export type DayLabelAnchor = 'start' | 'middle' | 'end'

// Centrado sobre su punto, salvo en las puntas: el primero arranca en el borde
// izquierdo y el último termina en el derecho, si no la mitad de cada uno se
// saldría del lienzo.
const ANCHOR_SHIFT: Record<DayLabelAnchor, string> = {
  start: 'none',
  middle: 'translateX(-50%)',
  end: 'translateX(-100%)',
}

export const DayLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'anchor',
})<{ anchor: DayLabelAnchor }>(({ theme, anchor }) => ({
  ...theme.typography.labelSm,
  position: 'absolute',
  top: 0,
  whiteSpace: 'nowrap',
  transform: ANCHOR_SHIFT[anchor],
  color: theme.vars.palette.text.secondary,
}))
