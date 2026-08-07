import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Typography } from '@mui/material'

import {
  CardBody,
  CardHeader,
  CardRoot,
  ComparisonDivider,
  ComparisonFooter,
  ComparisonSlot,
  CornerGlow,
  IconBox,
  MetaChip,
} from './StatCard.styles'
import type { StatCardProps, StatTone, StatTrend } from './StatCard.types'

// Salvo override, subir es mejora y bajar es alerta. Sin variación no hay
// dirección que señalar, así que el chip queda neutro.
function trendTone(trend: StatTrend): StatTone {
  if (trend.tone) return trend.tone
  if (trend.value === 0) return 'neutral'
  return trend.value < 0 ? 'error' : 'info'
}

// Los negativos ya traen su signo; a los positivos hay que agregarlo.
function formatTrend(value: number) {
  return `${value > 0 ? '+' : ''}${value}%`
}

function trendArrow(value: number) {
  if (value === 0) return null
  return value < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
  tag,
  trend,
  comparison,
}: StatCardProps) {
  // El tono de alerta es el único que además acentúa el borde y suma el halo:
  // una métrica en rojo tiene que saltar sin depender de leer el número.
  const accent = tone === 'error' ? tone : null

  const trendChip = trend ? (
    <MetaChip tone={trendTone(trend)}>
      {/* En 0 no se dibuja flecha: apuntar hacia arriba sería inventar una
          tendencia que el dato no tiene. */}
      {trendArrow(trend.value)}
      {formatTrend(trend.value)}
    </MetaChip>
  ) : null

  const tagChip = tag ? <MetaChip tone="neutral">{tag}</MetaChip> : null
  // La tendencia manda sobre la etiqueta fija: nunca se muestran las dos.
  const chip = trendChip ?? tagChip
  const hasHeader = Boolean(icon) || chip !== null

  return (
    <CardRoot accent={accent}>
      {accent ? <CornerGlow tone={accent} /> : null}

      {hasHeader ? (
        <CardHeader>
          {icon ? <IconBox tone={tone}>{icon}</IconBox> : null}
          {chip}
        </CardHeader>
      ) : null}

      <CardBody>
        <Typography variant="bodyMd" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="displaySm">{value}</Typography>
      </CardBody>

      {comparison ? (
        <ComparisonFooter>
          <ComparisonSlot>
            <Typography variant="labelSm" color="text.secondary">
              {comparison.currentLabel}
            </Typography>
            <Typography variant="labelMd">{comparison.currentValue}</Typography>
          </ComparisonSlot>
          <ComparisonDivider />
          <ComparisonSlot>
            <Typography variant="labelSm" color="text.secondary">
              {comparison.previousLabel}
            </Typography>
            <Typography variant="labelMd" color="text.secondary">
              {comparison.previousValue}
            </Typography>
          </ComparisonSlot>
        </ComparisonFooter>
      ) : null}
    </CardRoot>
  )
}
