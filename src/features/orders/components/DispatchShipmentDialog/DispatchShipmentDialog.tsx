import { Alert, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import {
  LoadingSpinner,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  ModalFrame,
} from 'shared/components'

import { ordersCopy } from '../../content'
import { useDispatchShipment } from '../../hooks/useDispatchShipment'
import { useOrderQuotes } from '../../hooks/useOrderQuotes'
import { useOriginWarehouses } from '../../hooks/useOriginWarehouses'
import type { OriginWarehouse } from '../../types'
import { originCandidates } from '../../utils/dispatch'
import { toDispatchPayload } from '../../utils/shipping'
import { QuoteOptionsPanel } from '../QuoteOptionsPanel'

import { DialogSection } from './DispatchShipmentDialog.styles'
import type { DispatchShipmentDialogProps } from './DispatchShipmentDialog.types'
import { OriginOptions } from './OriginOptions'

const { dispatch: copy } = ordersCopy.detail

const CONFLICT_STATUS = 409

/**
 * Despachar desde el detalle el envío de una orden que quedó sin despachar
 * (TESIS-134). Es la salida del camino que dejaba abierto el paso 3 del alta:
 * la orden se creó, el despacho falló y la pantalla se cerró.
 *
 * Cotiza la orden (`POST /orders/:id/quotes`) desde el depósito del que
 * salieron sus líneas, deja elegir la opción con la misma lista del paso 3 y
 * despacha con la integración que despacha, su costo y ese depósito. Un
 * despacho que falla se reintenta sin cerrar el diálogo.
 *
 * Resuelve sus datos adentro, a diferencia de los modales de producto: el
 * detalle sólo sabe que hay un envío pendiente, y todo lo que hace falta para
 * despacharlo —depósitos, cotización, despacho— es de este flujo.
 */
export function DispatchShipmentDialog({
  open,
  orderId,
  orderLabel,
  shipmentId,
  lines,
  onClose,
  onDispatched,
}: DispatchShipmentDialogProps) {
  const [pickedOriginId, setPickedOriginId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const warehouses = useOriginWarehouses()
  const candidates = warehouses.data === undefined ? [] : originCandidates(lines, warehouses.data)
  // Con un solo candidato el origen está decidido y no se pregunta.
  const origin =
    candidates.length === 1
      ? candidates[0]
      : (candidates.find((warehouse) => warehouse.id === pickedOriginId) ?? null)

  const quotes = useOrderQuotes(orderId, origin?.id ?? null)
  const dispatch = useDispatchShipment()

  // La opción elegida sólo cuenta si sigue entre las cotizadas: otro origen o
  // volver a cotizar pueden traer otra lista.
  const chosen = quotes.data?.find((quote) => quote.dispatchIntegrationId === selectedId) ?? null
  const alreadyDispatched = dispatch.error?.status === CONFLICT_STATUS

  function submit() {
    if (origin === null || chosen === null) return

    dispatch.mutate(
      { shipmentId, payload: toDispatchPayload(chosen, origin.id) },
      { onSuccess: () => onDispatched(chosen.providerName) },
    )
  }

  let confirmLabel = copy.confirm
  if (dispatch.isPending) confirmLabel = copy.confirming
  else if (dispatch.isError) confirmLabel = copy.retry

  return (
    <ModalFrame
      open={open}
      title={copy.title}
      subtitle={copy.subtitle(orderLabel)}
      closeLabel={copy.close}
      onClose={onClose}
      busy={dispatch.isPending}
    >
      <ModalBody>
        <DialogSection>
          <Typography variant="labelMd" component="h3">
            {copy.origin.title}
          </Typography>
          <OriginContent
            warehouses={warehouses}
            candidates={candidates}
            origin={origin}
            disabled={dispatch.isPending}
            onSelect={(warehouse) => setPickedOriginId(warehouse.id)}
          />
        </DialogSection>

        <DialogSection>
          <Typography variant="labelMd" component="h3">
            {copy.options.title}
          </Typography>
          {origin === null ? (
            <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
              {copy.options.waitingOrigin}
            </Typography>
          ) : (
            <QuoteOptionsPanel
              quotes={quotes}
              selectedId={chosen?.dispatchIntegrationId ?? null}
              disabled={dispatch.isPending}
              onSelect={(quote) => setSelectedId(quote.dispatchIntegrationId)}
            />
          )}
        </DialogSection>

        {dispatch.isError ? (
          <Alert severity="error" variant="outlined">
            {alreadyDispatched
              ? copy.errors.alreadyDispatched
              : `${copy.errors.failed} ${dispatch.error.message}`}
          </Alert>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <ModalFooterActions>
          <Button color="neutral" onClick={onClose} disabled={dispatch.isPending}>
            {alreadyDispatched ? copy.close : copy.cancel}
          </Button>
          {/* Un 409 no se reintenta: el envío ya tiene su etiqueta. */}
          {alreadyDispatched ? null : (
            <Button
              variant="contained"
              onClick={submit}
              disabled={chosen === null || dispatch.isPending}
            >
              {confirmLabel}
            </Button>
          )}
        </ModalFooterActions>
      </ModalFooter>
    </ModalFrame>
  )
}

interface OriginContentProps {
  warehouses: ReturnType<typeof useOriginWarehouses>
  candidates: OriginWarehouse[]
  origin: OriginWarehouse | null
  disabled: boolean
  onSelect: (warehouse: OriginWarehouse) => void
}

// Los estados del origen, fuera del cuerpo del diálogo para que éste se lea de
// un vistazo. Stateless y usado sólo acá: no justifica archivo propio.
function OriginContent({ warehouses, candidates, origin, disabled, onSelect }: OriginContentProps) {
  if (warehouses.isPending) {
    return (
      <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: 'center' }}>
        <LoadingSpinner />
        <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
          {copy.origin.loading}
        </Typography>
      </Stack>
    )
  }

  if (warehouses.isError) {
    return (
      <Alert
        severity="error"
        variant="outlined"
        action={
          <Button color="inherit" size="small" onClick={() => void warehouses.refetch()}>
            {copy.origin.retry}
          </Button>
        }
      >
        {copy.origin.error}
      </Alert>
    )
  }

  if (candidates.length === 1 && origin !== null) {
    return (
      <Stack spacing={0.25}>
        <Typography variant="bodyLg" sx={{ fontWeight: 600 }}>
          {origin.name}
        </Typography>
        <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
          {origin.address}
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
        {copy.origin.choose}
      </Typography>
      <OriginOptions
        warehouses={candidates}
        selectedId={origin?.id ?? null}
        onSelect={onSelect}
        disabled={disabled}
      />
    </Stack>
  )
}
