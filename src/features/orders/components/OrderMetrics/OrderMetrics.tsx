import { StatCard } from 'shared/components'

import { MetricsGrid } from './OrderMetrics.styles'
import type { OrderMetricsProps } from './OrderMetrics.types'

/**
 * Las métricas clave del encabezado de S08: total, unidades, operador logístico
 * y entrega. Presentacional — cada valor llega formateado.
 *
 * Una métrica sin dato usa el tono neutro: el ícono de acción al lado de un
 * «—» sugeriría un número que no existe.
 */
export function OrderMetrics({ metrics }: OrderMetricsProps) {
  return (
    <MetricsGrid>
      {metrics.map((metric) => (
        <StatCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          note={metric.note}
          icon={metric.icon}
          tone={metric.unknown ? 'neutral' : 'primary'}
        />
      ))}
    </MetricsGrid>
  )
}
