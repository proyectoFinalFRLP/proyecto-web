import type { UseQueryResult } from '@tanstack/react-query'

import type { ShippingQuote } from '../../types'

export interface QuoteOptionsPanelProps {
  /** La consulta de la cotización, con sus estados: cargando, error, vacía o con opciones. */
  quotes: Pick<UseQueryResult<ShippingQuote[]>, 'data' | 'isPending' | 'isError' | 'refetch'>
  /** La opción elegida, por la integración que la despacha; null si todavía no hay. */
  selectedId: number | null
  onSelect: (quote: ShippingQuote) => void
  /** Mientras se confirma no se cambia de operador. */
  disabled?: boolean
  /**
   * Volver a revisar el origen y el destino. Sólo lo ofrece quien puede
   * cambiarlos: el asistente sí, el detalle de una orden ya creada no.
   */
  onReview?: () => void
}
