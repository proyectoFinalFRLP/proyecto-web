import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { Box, Button, Divider, Tooltip, Typography } from '@mui/material'
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
 */
export function PaymentSummaryCard({ subtotal, shipping, total }: PaymentSummaryCardProps) {
  const titleId = useId()

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
          {shipping ?? paymentCopy.shippingPending}
        </Amount>
      </SummaryRow>

      <Divider />

      <SummaryRow>
        <TotalLabel>{paymentCopy.total}</TotalLabel>
        <TotalAmount>{total}</TotalAmount>
      </SummaryRow>

      {/* Sin endpoint de facturación: la acción queda visible y apagada. El
          envoltorio deja que el Tooltip reciba el hover del botón deshabilitado. */}
      <Tooltip title={paymentCopy.invoicePending}>
        <Box component="span">
          <Button fullWidth variant="outlined" startIcon={<DownloadOutlinedIcon />} disabled>
            {paymentCopy.invoice}
          </Button>
        </Box>
      </Tooltip>
    </SummaryCard>
  )
}
