export interface PaymentSummaryCardProps {
  /** Importes ya formateados. */
  subtotal: string
  /** Null cuando el envío todavía no tiene costo: se muestra como pendiente. */
  shipping: string | null
  total: string
  /**
   * Un retiro en local no lleva envío (TESIS-162), así que su costo no está
   * «sin cotizar»: no va a cotizarse nunca. La fila dice de qué se trata en vez
   * de prometer un precio que no va a llegar.
   */
  pickup?: boolean
}
