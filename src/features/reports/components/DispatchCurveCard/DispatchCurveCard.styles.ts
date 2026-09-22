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
  color: theme.palette.text.secondary,
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
  stroke: theme.palette.divider,
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
}))

export const AreaPath = styled('path')(({ theme }) => ({
  fill: theme.palette.primary.main,
  opacity: AREA_OPACITY,
}))

export const LinePath = styled('path')(({ theme }) => ({
  fill: 'none',
  stroke: theme.palette.primary.main,
  strokeWidth: LINE_WIDTH,
  strokeLinecap: 'round',
  vectorEffect: 'non-scaling-stroke',
}))

export const LabelsRow = styled(Box)({
  gridColumn: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const DayLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.labelSm,
  color: theme.palette.text.secondary,
}))
