import {
  areaPath,
  axisTicks,
  CHART_FRAME,
  linePath,
  niceCeiling,
  plotPoints,
  tickOffsets,
} from '../../utils/chart'

import {
  AreaPath,
  AxisColumn,
  AxisTick,
  ChartGrid,
  ChartSvg,
  DayLabel,
  GridLine,
  LabelsRow,
  LinePath,
} from './DispatchCurveCard.styles'
import type { LineChartProps } from './DispatchCurveCard.types'

/**
 * Gráfico de líneas de la curva de despacho: grilla, área y trazo suave sobre
 * un SVG propio, como lo dibuja el diseño. No hay librería de gráficos en el
 * stack y un solo gráfico no la justifica: la geometría vive en `utils/chart`.
 *
 * Presentacional: recibe la serie y el formato del eje. El techo del eje sale
 * de los datos, así la misma curva sirve para órdenes y para pesos.
 */
export function LineChart({ values, labels, formatValue, ariaLabel }: LineChartProps) {
  const ceiling = niceCeiling(values)
  const points = plotPoints(values, ceiling)
  const offsets = tickOffsets(CHART_FRAME)

  return (
    <ChartGrid>
      <AxisColumn aria-hidden>
        {axisTicks(ceiling).map((tick) => (
          <AxisTick key={tick}>{formatValue(tick)}</AxisTick>
        ))}
      </AxisColumn>

      <ChartSvg
        viewBox={`0 0 ${CHART_FRAME.width} ${CHART_FRAME.height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        {offsets.map((offset) => (
          <GridLine key={offset} x1={0} y1={offset} x2={CHART_FRAME.width} y2={offset} />
        ))}
        <AreaPath d={areaPath(points)} />
        <LinePath d={linePath(points)} />
      </ChartSvg>

      <LabelsRow aria-hidden>
        {labels.map((label) => (
          <DayLabel key={label}>{label}</DayLabel>
        ))}
      </LabelsRow>
    </ChartGrid>
  )
}
