import type { ReactNode } from 'react'
import type { StatTone } from 'shared/components'

export interface OrderMetric {
  id: string
  label: string
  /** Valor ya formateado. */
  value: string
  /** El dato que acompaña al valor: medio de pago, líneas, la entrega comprometida. */
  note?: string
  icon: ReactNode
  /** Atenúa el valor cuando es la marca de "sin dato" y no un dato. */
  unknown?: boolean
  /** Chip de alerta de la tarjeta («Demorada»), con su tono. */
  tag?: { label: string; tone: StatTone }
}

export interface OrderMetricsProps {
  metrics: OrderMetric[]
}
