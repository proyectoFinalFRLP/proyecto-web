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
  trend?: StatTrend
  /** Footer comparativo contra el período anterior. */
  comparison?: StatComparison
}

export interface CompactStatCardProps {
  label: string
  value: string
  icon?: ReactNode
  tone?: StatTone
}
