import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useState } from 'react'
import type { MouseEvent } from 'react'

import { reportsCopy } from '../../content'
import type { CurveMetric } from '../../types'
import { formatCompact, formatCompactMoney } from '../../utils/format'

import { LineChart } from './LineChart'
import { CardHeading, CurveCard } from './SalesCurveCard.styles'
import type { SalesCurveCardProps } from './SalesCurveCard.types'

const { curve: copy } = reportsCopy

// Cada serie con su formato de eje: las órdenes se cuentan, la facturación
// lleva el signo de pesos.
const AXIS_FORMAT: Record<CurveMetric, (value: number) => string> = {
  orders: formatCompact,
  revenue: formatCompactMoney,
}

/**
 * «Curva de ventas» de S14: la serie del período con el segmentado para
 * alternar entre órdenes creadas y facturación. Los puntos traen las dos
 * series; cuál se dibuja es estado de la tarjeta y de nadie más.
 *
 * El diseño la llamaba «Curva de despacho», pero lo que dibuja son ventas —las
 * órdenes que entraron y lo que facturaron—, no despachos.
 */
export function SalesCurveCard({ points, granularity = 'day' }: SalesCurveCardProps) {
  const [metric, setMetric] = useState<CurveMetric>('orders')

  // El segmentado es exclusivo: soltar la opción activa devuelve `null`, y una
  // curva sin serie no existe, así que ese clic se ignora.
  function changeMetric(_event: MouseEvent<HTMLElement>, next: CurveMetric | null) {
    if (next !== null) setMetric(next)
  }

  return (
    <CurveCard>
      <CardHeading>
        <Typography variant="h3" component="h2">
          {copy.title}
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={metric}
          onChange={changeMetric}
          aria-label={copy.metricLabel}
        >
          <ToggleButton value="orders">{copy.metrics.orders}</ToggleButton>
          <ToggleButton value="revenue">{copy.metrics.revenue}</ToggleButton>
        </ToggleButtonGroup>
      </CardHeading>

      <LineChart
        values={points.map((point) => point[metric])}
        labels={points.map((point) => point.label)}
        formatValue={AXIS_FORMAT[metric]}
        ariaLabel={copy.chartLabel(copy.metrics[metric], granularity)}
      />
    </CurveCard>
  )
}
