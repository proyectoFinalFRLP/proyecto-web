import { Typography } from '@mui/material'

import { ordersCopy } from '../../content'

import { Metric, MetricText, MetricValue, SummaryRoot } from './DraftSummaryCard.styles'
import type { DraftSummaryCardProps } from './DraftSummaryCard.types'

const { summary: copy } = ordersCopy.draft

/**
 * Los dos totales del paso 1, recalculados con cada cambio del borrador: el
 * subtotal de productos (lo que pide la card) y el peso estimado (lo que
 * dibuja S05, y lo que el paso 3 necesita para cotizar).
 */
export function DraftSummaryCard({ subtotal, weight }: DraftSummaryCardProps) {
  return (
    <SummaryRoot component="section">
      <Metric>
        <MetricText>
          <Typography variant="labelCaps" color="text.secondary">
            {copy.subtotal}
          </Typography>
          <Typography variant="bodyMd" color="text.secondary">
            {copy.subtotalHint}
          </Typography>
        </MetricText>
        <MetricValue emphasis="primary" aria-label={copy.subtotal}>
          {subtotal}
        </MetricValue>
      </Metric>

      <Metric>
        <MetricText>
          <Typography variant="labelCaps" color="text.secondary">
            {copy.weight}
          </Typography>
          <Typography variant="bodyMd" color="text.secondary">
            {copy.weightHint}
          </Typography>
        </MetricText>
        <MetricValue emphasis="secondary" aria-label={copy.weight}>
          {weight}
        </MetricValue>
      </Metric>
    </SummaryRoot>
  )
}
