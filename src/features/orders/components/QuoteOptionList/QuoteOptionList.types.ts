import type { ShippingQuote } from '../../types'

export interface QuoteOptionListProps {
  /** Ordenadas por precio, como las devuelve la cotización. */
  quotes: ShippingQuote[]
  /** La opción elegida, por la integración que la despacha; null si todavía no hay. */
  selectedId: number | null
  onSelect: (quote: ShippingQuote) => void
  /** Mientras se confirma no se cambia de operador. */
  disabled?: boolean
}
