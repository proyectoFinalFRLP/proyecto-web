import type { ReactNode } from 'react'

export interface OrderConfirmCardProps {
  /** Lo que suman los productos del borrador. */
  subtotal: number
  /** El costo de la opción elegida; null mientras no se eligió ninguna. */
  shippingCost: number | null
  /** Peso estimado del paquete, en kg. */
  weight: number
  /** De dónde sale: el nombre del depósito de origen. */
  originName: string
  /** A dónde va: "CABA, Ciudad Autónoma de Buenos Aires · CP 1193". No se muestra con `pickup`. */
  destinationLabel: string
  /**
   * El cliente la retira en el local: no hay operador, despacho ni destino de
   * qué hablar, y el depósito es a donde va el cliente (TESIS-173).
   */
  pickup?: boolean
  /** Si «Confirmar orden» se puede apretar: hay una opción elegida (o es un retiro) y no se está confirmando. */
  canConfirm: boolean
  confirming: boolean
  /** El rótulo del botón principal: «Confirmar orden», o reintentar el despacho. */
  confirmLabel: string
  onConfirm: () => void
  /** Ausente cuando ya no se puede volver: la orden existe. */
  onBack?: () => void
  /** Lo que salió mal al confirmar, arriba de los botones. */
  status?: ReactNode
}
