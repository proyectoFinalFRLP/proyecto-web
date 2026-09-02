import { Skeleton, Typography } from '@mui/material'

import { CardRoot, IconWrap, MetricBlock, VALUE_SKELETON } from './StatCard.styles'
import type { StatCardProps } from './StatCard.types'

// Separador de miles: los KPIs de operación llegan a 5 cifras y "14.285" se lee
// de un vistazo, "14285" no.
const NUMBER_FORMAT = new Intl.NumberFormat('es-AR')

// Tarjeta de métrica del dashboard: ícono + label + valor (o skeleton mientras
// carga) + caption opcional.
export function StatCard({
  label,
  value,
  icon,
  tone = 'info',
  caption,
  loading = false,
}: StatCardProps) {
  const displayValue = typeof value === 'number' ? NUMBER_FORMAT.format(value) : value

  return (
    <CardRoot aria-busy={loading}>
      {icon ? <IconWrap tone={tone}>{icon}</IconWrap> : null}
      <MetricBlock>
        <Typography variant="labelMd" color="text.secondary">
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="rounded" width={VALUE_SKELETON.width} height={VALUE_SKELETON.height} />
        ) : (
          <Typography variant="displaySm">{displayValue}</Typography>
        )}
      </MetricBlock>
      {caption ? (
        <Typography variant="labelSm" color="text.secondary">
          {caption}
        </Typography>
      ) : null}
    </CardRoot>
  )
}
