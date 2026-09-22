import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { StatCard } from 'shared/components'
import type { StatTrend } from 'shared/components'

import { reportsCopy } from '../../content'
import type { TrendedValue } from '../../types'
import { formatCompactMoney, formatInteger, formatPercent } from '../../utils/format'

import { MetricsGrid } from './ReportMetrics.styles'
import type { ReportMetricsProps } from './ReportMetrics.types'

const { kpis: copy } = reportsCopy

/**
 * El chip de variación de una métrica. Sin período anterior no hay chip: un
 * «0%» inventado se leería como «igual que antes».
 *
 * Los tonos son los del MetricCard del diseño —subir es bueno, bajar es una
 * advertencia— y no los del default de `StatCard`, que pinta la baja como
 * error. Una caída del 0,4% en el cumplimiento merece atención, no alarma.
 * El 0 no lleva tono: la tarjeta lo deja neutro.
 */
function trendOf({ trend }: TrendedValue): StatTrend | undefined {
  if (trend === null) return undefined
  if (trend === 0) return { value: trend }
  return { value: trend, tone: trend < 0 ? 'warning' : 'success' }
}

/**
 * Las cuatro métricas de S14-Reportes, en su orden. Presentacional: recibe los
 * agregados del dominio y decide sólo cómo se ven.
 */
export function ReportMetrics({ kpis }: ReportMetricsProps) {
  const { dispatchedUnits, revenue, onTimeDeliveryRate, activeAnomalies } = kpis

  return (
    <MetricsGrid>
      <StatCard
        label={copy.dispatchedUnits}
        value={formatInteger(dispatchedUnits.value)}
        trend={trendOf(dispatchedUnits)}
        icon={<Inventory2OutlinedIcon />}
      />
      <StatCard
        label={copy.revenue}
        value={formatCompactMoney(revenue.value)}
        trend={trendOf(revenue)}
        icon={<PaymentsOutlinedIcon />}
      />
      <StatCard
        label={copy.onTimeDelivery}
        value={formatPercent(onTimeDeliveryRate.value)}
        trend={trendOf(onTimeDeliveryRate)}
        icon={<ScheduleOutlinedIcon />}
      />
      {/* Con una anomalía crítica la tarjeta entera pasa a alerta: borde,
          ícono y chip, como el `critical` del MetricCard del diseño. */}
      <StatCard
        label={copy.activeAnomalies}
        value={formatInteger(activeAnomalies.count)}
        tone={activeAnomalies.critical ? 'error' : 'primary'}
        tag={activeAnomalies.critical ? copy.critical : undefined}
        tagTone="error"
        tagIcon={<WarningAmberOutlinedIcon />}
        icon={<WarningAmberOutlinedIcon />}
      />
    </MetricsGrid>
  )
}
