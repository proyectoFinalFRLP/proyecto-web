import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Alert, Button, Divider, Stack, Typography } from '@mui/material'
import { useId } from 'react'
import { formatMoney } from 'shared/utils'

import { ordersCopy } from '../../content'
import { formatWeight } from '../../utils/format'
import { totalWithShipping } from '../../utils/shipping'

import { ConfirmCardRoot, SummaryLine, TotalValue } from './OrderConfirmCard.styles'
import type { OrderConfirmCardProps } from './OrderConfirmCard.types'

const { summary: copy } = ordersCopy.carrier

/**
 * «Resumen de la orden» del paso 3 (S07): lo que se va a crear, el envío
 * elegido, el total final y los dos botones del asistente.
 *
 * El total suma el envío apenas se elige una opción, que es lo que pide la card
 * («el costo de envío se suma al total general de forma transparente»). Sin
 * opción elegida el envío no cuesta 0: dice que falta elegirlo, y el total es
 * lo que se sabe.
 *
 * Con retiro en el local (`pickup`) el resumen deja de hablar de un envío
 * (TESIS-173): no pide elegir operador, no dice de dónde sale ni a dónde va
 * —nada viaja— sino dónde lo retira el cliente, y el aviso final no promete un
 * despacho. Antes un retiro decía «Va a: La Plata» y «se emite el despacho con
 * el operador elegido».
 */
export function OrderConfirmCard({
  subtotal,
  shippingCost,
  weight,
  originName,
  destinationLabel,
  pickup = false,
  canConfirm,
  confirming,
  confirmLabel,
  onConfirm,
  onBack,
  status,
}: OrderConfirmCardProps) {
  const titleId = useId()

  return (
    <ConfirmCardRoot component="section" aria-labelledby={titleId}>
      <Typography id={titleId} variant="h3" component="h2">
        {copy.title}
      </Typography>

      <Stack spacing={1.5}>
        <Line label={copy.products} value={formatMoney(subtotal)} />
        {pickup ? (
          <Line label={copy.shipping} value={copy.shippingPickup} />
        ) : (
          <Line
            label={copy.shipping}
            value={shippingCost === null ? copy.shippingPending : formatMoney(shippingCost)}
            muted={shippingCost === null}
          />
        )}
        <Line label={copy.weight} value={formatWeight(weight)} />
        {pickup ? (
          <Line label={copy.pickupAt} value={originName} />
        ) : (
          <>
            <Line label={copy.origin} value={originName} />
            <Line label={copy.destination} value={destinationLabel} />
          </>
        )}
      </Stack>

      <Divider />

      <Stack spacing={0.5}>
        <Typography variant="labelCaps" sx={{ color: 'text.secondary' }}>
          {copy.total}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
          <TotalValue aria-label={copy.total}>
            {formatMoney(totalWithShipping(subtotal, shippingCost))}
          </TotalValue>
          <Typography variant="labelSm" sx={{ color: 'text.secondary' }}>
            {copy.currency}
          </Typography>
        </Stack>
      </Stack>

      {status}

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<CheckCircleOutlineIcon />}
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        {confirming ? copy.confirming : confirmLabel}
      </Button>
      {onBack === undefined ? null : (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ArrowBackIcon />}
          disabled={confirming}
          onClick={onBack}
        >
          {ordersCopy.shipping.back}
        </Button>
      )}

      <Alert severity="info" variant="outlined">
        {pickup ? copy.pickupNotice : copy.notice}
      </Alert>
    </ConfirmCardRoot>
  )
}

function Line({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <SummaryLine>
      {/* El rótulo no se parte: el que cede espacio es el valor, que puede ser
          largo (el destino completo). */}
      <Typography variant="bodyMd" sx={{ color: 'text.secondary', flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="dataMono" sx={{ color: muted ? 'text.secondary' : 'text.primary' }}>
        {value}
      </Typography>
    </SummaryLine>
  )
}
