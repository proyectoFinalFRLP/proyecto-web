import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Skeleton, Typography } from '@mui/material'

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
  VALUE_SKELETON_WIDTH,
} from './StatCard.styles'
import type { StatCardProps, StatTone, StatTrend } from './StatCard.types'

// Salvo override, subir es mejora y bajar es alerta. Sin variación no hay
// dirección que señalar, así que el chip queda neutro.
function trendTone(trend: StatTrend): StatTone {
  if (trend.tone) return trend.tone
  if (trend.value === 0) return 'neutral'
  return trend.value < 0 ? 'error' : 'info'
}

// Con el signo siempre a la vista y en el locale de la app: un «+12.4%» al lado
// de un valor «124.592» mezcla el punto decimal con el de miles. Un decimal
// alcanza: el chip señala la dirección, no la cifra exacta.
const TREND_FORMAT = new Intl.NumberFormat('es-AR', {
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
})

function formatTrend(value: number) {
  return `${TREND_FORMAT.format(value)}%`
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
  tagTone = 'neutral',
  tagIcon,
  trend,
  comparison,
  loading = false,
  note,
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

  const tagChip = tag ? (
    <MetaChip tone={tagTone}>
      {tagIcon}
      {tag}
    </MetaChip>
  ) : null
  // La tendencia manda sobre la etiqueta fija: nunca se muestran las dos.
  const chip = trendChip ?? tagChip
  const hasHeader = Boolean(icon) || chip !== null

  return (
    <CardRoot accent={accent} aria-busy={loading}>
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
        {/* El skeleton va adentro del Typography para heredar su tamaño de
            fuente: así mide exactamente la línea que después ocupa el valor. */}
        <Typography variant="displaySm">
          {loading ? <Skeleton width={VALUE_SKELETON_WIDTH} /> : value}
        </Typography>
      </CardBody>

      {note ? (
        <Typography variant="labelSm" color="text.secondary">
          {note}
        </Typography>
      ) : null}

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
