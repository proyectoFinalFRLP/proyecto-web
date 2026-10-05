import type { CurveGranularity, CurvePoint } from '../../types'

export interface DispatchCurveCardProps {
  points: CurvePoint[]
  /** Si cada punto es un día o una semana: lo dice la descripción del gráfico. */
  granularity?: CurveGranularity
}

export interface LineChartProps {
  /** La serie, un valor por rótulo del eje X y en el mismo orden. */
  values: number[]
  /** Rótulos del eje X. Únicos: son la identidad de cada punto («lun», «12/09»). */
  labels: string[]
  /** Formato de los rótulos del eje Y (unidades o pesos, según la serie). */
  formatValue: (value: number) => string
  /** Descripción del gráfico para el lector de pantalla. */
  ariaLabel: string
}
