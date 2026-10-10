import { useElementWidth } from '../../hooks/useElementWidth'
import {
  areaPath,
  axisTicks,
  CHART_FRAME,
  labelStep,
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
  DAY_LABEL_SLOT,
  DayLabel,
  GridLine,
  LabelsRow,
  LinePath,
} from './DispatchCurveCard.styles'
import type { DayLabelAnchor } from './DispatchCurveCard.styles'
import type { LineChartProps } from './DispatchCurveCard.types'

function anchorOf(index: number, last: number): DayLabelAnchor {
  if (index === 0) return 'start'
  return index === last ? 'end' : 'middle'
}

/**
 * Gráfico de líneas de la curva de despacho: grilla, área y trazo suave sobre
 * un SVG propio, como lo dibuja el diseño. No hay librería de gráficos en el
 * stack y un solo gráfico no la justifica: la geometría vive en `utils/chart`.
 *
 * Presentacional: recibe la serie y el formato del eje. El techo del eje sale
 * de los datos, así la misma curva sirve para órdenes y para pesos.
 *
 * Los rótulos del eje X se ralean según el ancho: si los 30 días del mes no
 * entran, va uno cada N días. La curva sigue teniendo todos sus puntos.
 */
export function LineChart({ values, labels, formatValue, ariaLabel }: LineChartProps) {
  const ceiling = niceCeiling(values)
  const points = plotPoints(values, ceiling)
  const offsets = tickOffsets(CHART_FRAME)
  const [labelsRef, labelsWidth] = useElementWidth<HTMLDivElement>()
  const step = labelStep(labels.length, labelsWidth, DAY_LABEL_SLOT)
  const last = labels.length - 1

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

      <LabelsRow ref={labelsRef} aria-hidden>
        {labels.map((label, index) =>
          index % step === 0 ? (
            <DayLabel
              key={label}
              anchor={anchorOf(index, last)}
              // El mismo reparto que `plotPoints`: el primero en 0 y el último
              // en el borde, así cada rótulo cae debajo de su punto.
              style={{ left: `${last > 0 ? (index / last) * 100 : 0}%` }}
            >
              {label}
            </DayLabel>
          ) : null,
        )}
      </LabelsRow>
    </ChartGrid>
  )
}
