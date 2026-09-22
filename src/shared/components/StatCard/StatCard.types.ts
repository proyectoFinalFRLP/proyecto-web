import type { ReactNode } from 'react'

/**
 * Tono semántico de la métrica: pinta el ícono, el chip y el acento del borde.
 * Mismos estados que `StatusVariant`, más `primary` para la intención de marca.
 */
export type StatTone = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'neutral'

export interface StatTrend {
  /**
   * Variación porcentual respecto del período anterior. El signo define la
   * dirección de la flecha y, por defecto, el tono del chip.
   */
  value: number
  /**
   * Fuerza el tono del chip. Necesario cuando una baja es buena: que caiga la
   * tasa de mercadería dañada es una mejora, no un error.
   */
  tone?: StatTone
}

export interface StatComparison {
  currentLabel: string
  currentValue: string
  previousLabel: string
  previousValue: string
}

export interface StatCardProps {
  label: string
  /**
   * Valor ya formateado. El componente no decide separadores de miles, monedas
   * ni unidades: eso depende del dato y del locale, no del design system.
   */
  value: string
  icon?: ReactNode
  /** Default `primary`. Con `error` la tarjeta suma borde y glow de acento. */
  tone?: StatTone
  /** Chip fijo (ej. `LIVE`). Se ignora si además se pasa `trend`. */
  tag?: string
  /**
   * Tono del chip fijo. Por defecto `neutral`, que es lo que corresponde a una
   * etiqueta informativa; una alerta («Crítico») lleva el tono del estado.
   */
  tagTone?: StatTone
  /** Ícono a la izquierda del chip fijo: nunca color solo, siempre color + ícono. */
  tagIcon?: ReactNode
  trend?: StatTrend
  /** Footer comparativo contra el período anterior. */
  comparison?: StatComparison
  /**
   * Mientras el dato viaja, el valor se reemplaza por un skeleton con la misma
   * altura de línea, así la tarjeta no salta cuando llega el número. `value`
   * se ignora en ese estado; el resto (ícono, chip, label) se muestra igual.
   */
  loading?: boolean
  /**
   * Aclaración debajo del valor (la `note` del MetricCard del diseño): el dato
   * que acompaña al número sin competir con él, como "3 líneas" bajo "67".
   */
  note?: string
}

export interface CompactStatCardProps {
  label: string
  value: string
  icon?: ReactNode
  tone?: StatTone
}
