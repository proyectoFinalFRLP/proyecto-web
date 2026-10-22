import { Divider, Typography } from '@mui/material'
import { useId } from 'react'

import { ordersCopy } from '../../content'

import {
  Amount,
  SummaryCard,
  SummaryRow,
  TotalAmount,
  TotalLabel,
} from './PaymentSummaryCard.styles'
import type { PaymentSummaryCardProps } from './PaymentSummaryCard.types'

const paymentCopy = ordersCopy.detail.payment

/**
 * «Resumen de pago» de S08: productos, envío y total. Presentacional — los
 * montos llegan ya calculados (`paymentSummary`) y formateados.
 *
 * Sin «Descargar factura»: facturar de verdad (AFIP, comprobante fiscal) queda
 * fuera del alcance del proyecto, y un botón apagado para siempre era ruido.
 */
export function PaymentSummaryCard({
  subtotal,
  shipping,
  total,
  pickup = false,
}: PaymentSummaryCardProps) {
  const titleId = useId()
  const missingShipping = pickup ? paymentCopy.shippingPickup : paymentCopy.shippingPending

  return (
    <SummaryCard component="section" aria-labelledby={titleId}>
      <Typography id={titleId} variant="labelCaps" component="h2" color="text.secondary">
        {paymentCopy.title}
      </Typography>

      <SummaryRow>
        <Typography variant="bodyMd" color="text.secondary">
          {paymentCopy.subtotal}
        </Typography>
        <Amount variant="dataMono" pending={false}>
          {subtotal}
        </Amount>
      </SummaryRow>

      {/* Criterio de la card: el costo coincide con el `shipping_cost` del envío. */}
      <SummaryRow>
        <Typography variant="bodyMd" color="text.secondary">
          {paymentCopy.shipping}
        </Typography>
        <Amount variant="dataMono" pending={shipping === null}>
          {shipping ?? missingShipping}
        </Amount>
      </SummaryRow>

      <Divider />

      <SummaryRow>
        <TotalLabel>{paymentCopy.total}</TotalLabel>
        <TotalAmount>{total}</TotalAmount>
      </SummaryRow>
    </SummaryCard>
  )
}
