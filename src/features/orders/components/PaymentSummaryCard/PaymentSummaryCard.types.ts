export interface PaymentSummaryCardProps {
  /** Importes ya formateados. */
  subtotal: string
  /** Null cuando el envío todavía no tiene costo: se muestra como pendiente. */
  shipping: string | null
  total: string
}
