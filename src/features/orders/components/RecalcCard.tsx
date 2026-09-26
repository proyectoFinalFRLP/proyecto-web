import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined'
import { Divider, Stack, Typography } from '@mui/material'
import { StatusBadge } from 'shared/components'
import type { StatusVariant } from 'shared/components'

import { ordersCopy } from '../content'
import { formatMoney } from '../utils/format'

import { FormSection } from './FormSection'

const { recalc: copy } = ordersCopy.edit

export interface RecalcCardProps {
  /** Lo que se facturó: el `total_amount` persistido, o la suma de las líneas si no hay. */
  previousSubtotal: number
  nextSubtotal: number
  /** Costo del envío ya cotizado; `null` si todavía no se cotizó. */
  shippingCost: number | null
}

function differenceBadge(difference: number): { status: StatusVariant; label: string } {
  if (difference === 0) return { status: 'neutral', label: copy.noDifference }

  const sign = difference > 0 ? '+' : '−'
  return {
    // Una suba es la que hay que mirar dos veces antes de guardar: se le cobra
    // de más a un cliente que ya pagó.
    status: difference > 0 ? 'warning' : 'info',
    label: copy.difference(`${sign}${formatMoney(Math.abs(difference))}`),
  }
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="dataMono" sx={{ color: muted ? 'text.secondary' : 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  )
}

/**
 * «Recálculo» de S09: cómo cambia lo que se cobra con lo que se está editando,
 * en vivo, sin guardar ni recargar.
 *
 * El diseño suma «Gastos de gestión» e impuestos, que la orden no registra: no
 * se inventan. El envío entra si ya tiene costo; si no, se dice que falta
 * cotizar en vez de sumarlo como cero.
 */
export function RecalcCard({ previousSubtotal, nextSubtotal, shippingCost }: RecalcCardProps) {
  const total = nextSubtotal + (shippingCost ?? 0)
  const badge = differenceBadge(Math.round((nextSubtotal - previousSubtotal) * 100) / 100)

  return (
    <FormSection icon={<CalculateOutlinedIcon aria-hidden />} title={copy.title}>
      <Stack spacing={1.25}>
        <Row label={copy.previous} value={formatMoney(previousSubtotal)} muted />
        <Row label={copy.next} value={formatMoney(nextSubtotal)} />
        <Row
          label={copy.shipping}
          value={shippingCost === null ? copy.shippingPending : formatMoney(shippingCost)}
          muted={shippingCost === null}
        />
      </Stack>
      <Divider />
      <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
        <Typography variant="labelCaps" sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}>
          {copy.total}
        </Typography>
        <Typography
          variant="displaySm"
          component="p"
          sx={(theme) => ({ fontFamily: theme.typography.dataMono.fontFamily })}
        >
          {formatMoney(total)}
        </Typography>
        <StatusBadge status={badge.status} label={badge.label} />
      </Stack>
    </FormSection>
  )
}
