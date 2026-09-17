import type { ReactNode } from 'react'

export interface OrderMetric {
  id: string
  label: string
  /** Valor ya formateado. */
  value: string
  /** El dato que acompaña al valor: medio de pago, líneas, tipo de servicio. */
  note?: string
  icon: ReactNode
  /** Atenúa el valor cuando es la marca de "sin dato" y no un dato. */
  unknown?: boolean
}

export interface OrderMetricsProps {
  metrics: OrderMetric[]
}
