import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { Alert, Button, Tooltip, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { ConfirmDialog, LoadingSpinner } from 'shared/components'
import { notify } from 'shared/store'
import { formatRelativeTime } from 'shared/utils'

import { inventoryCopy } from '../../content'
import {
  CONFLICT_STATUS_SETTLED,
  useCreateTransfer,
  useProductTransfers,
  useSettleTransfer,
} from '../../hooks/useInventory'
import type { CreateTransferPayload, StockTransfer, TransferOutcome } from '../../types'
import { TransferStockModal } from '../TransferStockModal'

import {
  CardHeader,
  EmptyState,
  HeaderText,
  TransferActions,
  TransferList,
  TransferRow,
  TransfersCard,
  TransferText,
} from './ProductTransfers.styles'
import type { ProductTransfersProps } from './ProductTransfers.types'

const copy = inventoryCopy.detail.transfers
const modalCopy = inventoryCopy.detail.transferModal

// Status con los que la API rechaza despachar: el origen ya no tiene esas
// unidades (422) o el stock del producto está tomado por otra operación (409).
const INSUFFICIENT_STATUS = 422
const LOCKED_STATUS = 409

interface PendingSettlement {
  transfer: StockTransfer
  outcome: TransferOutcome
}

function createErrorMessage(status: number | undefined): string {
  if (status === INSUFFICIENT_STATUS) return modalCopy.insufficient
  if (status === LOCKED_STATUS) return modalCopy.busy
  return modalCopy.failed
}

/**
 * Transferencias en vuelo de un producto, con el alta y la liquidación.
 *
 * Vive en el detalle (S12) aunque el diseño no la tiene: la API de
 * transferencias existe desde TESIS-103 y era la única forma de mover unidades
 * entre depósitos que no tenía pantalla.
 */
export function ProductTransfers({ product, warehouses }: ProductTransfersProps) {
  const transfers = useProductTransfers(product.id)
  const create = useCreateTransfer()
  const settle = useSettleTransfer()
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState<PendingSettlement | undefined>(undefined)

  const canCreate = product.stocks.some((stock) => stock.quantity > 0) && warehouses.length > 1

  // Con `useMemo` el "hace 2 horas" no salta por un re-render del padre: mismo
  // criterio que el pie del modal de edición.
  const rows = useMemo(
    () =>
      (transfers.data ?? []).map((transfer) => ({
        transfer,
        dispatched: formatRelativeTime(transfer.dispatchedAt),
      })),
    [transfers.data],
  )

  function submit(payload: CreateTransferPayload) {
    create.mutate(payload, {
      onSuccess: () => {
        notify(modalCopy.created, 'success')
        setCreating(false)
      },
    })
  }

  function confirmSettlement() {
    if (pending === undefined) return

    settle.mutate(
      { id: pending.transfer.id, outcome: pending.outcome },
      {
        onSuccess: () =>
          notify(pending.outcome === 'receive' ? copy.received : copy.cancelled, 'success'),
        // Un 409 quiere decir que otra persona ya la liquidó: la invalidación
        // del hook la saca de la lista y el aviso dice por qué desapareció.
        onError: (error) =>
          notify(
            error.status === CONFLICT_STATUS_SETTLED ? copy.alreadySettled : copy.settleFailed,
            error.status === CONFLICT_STATUS_SETTLED ? 'info' : 'error',
          ),
        onSettled: () => setPending(undefined),
      },
    )
  }

  const createButton = (
    <Button
      variant="outlined"
      startIcon={<SwapHorizIcon />}
      disabled={!canCreate}
      onClick={() => {
        create.reset()
        setCreating(true)
      }}
    >
      {copy.create}
    </Button>
  )

  return (
    <TransfersCard>
      <CardHeader>
        <HeaderText>
          <Typography variant="h3" component="h2">
            {copy.title}
          </Typography>
          <Typography variant="labelSm" color="text.secondary">
            {copy.subtitle}
          </Typography>
        </HeaderText>
        {/* El botón apagado dice por qué: un `span` porque MUI no muestra el
            tooltip sobre un botón deshabilitado. */}
        {canCreate ? (
          createButton
        ) : (
          <Tooltip title={copy.createDisabled}>
            <span>{createButton}</span>
          </Tooltip>
        )}
      </CardHeader>

      {transfers.isPending ? (
        <EmptyState>
          <LoadingSpinner />
        </EmptyState>
      ) : transfers.isError ? (
        <EmptyState>
          <Alert severity="error">{copy.error}</Alert>
        </EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>
          <Typography variant="bodyMd" color="text.secondary">
            {copy.empty}
          </Typography>
        </EmptyState>
      ) : (
        <TransferList aria-label={copy.listLabel}>
          {rows.map(({ transfer, dispatched }) => (
            <TransferRow key={transfer.id}>
              <TransferText>
                <Typography variant="bodyMd">
                  {copy.route(transfer.origin.name, transfer.destination.name)}
                </Typography>
                <Typography variant="labelSm" color="text.secondary">
                  {copy.units(transfer.quantity)}
                  {dispatched === null ? '' : ` · ${copy.dispatchedAt(dispatched)}`}
                </Typography>
              </TransferText>
              <TransferActions>
                <Button
                  size="small"
                  color="neutral"
                  variant="text"
                  onClick={() => setPending({ transfer, outcome: 'cancel' })}
                >
                  {copy.cancel}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setPending({ transfer, outcome: 'receive' })}
                >
                  {copy.receive}
                </Button>
              </TransferActions>
            </TransferRow>
          ))}
        </TransferList>
      )}

      <TransferStockModal
        open={creating}
        product={product}
        warehouses={warehouses}
        submitting={create.isPending}
        error={create.isError ? createErrorMessage(create.error.status) : undefined}
        onSubmit={submit}
        onClose={() => setCreating(false)}
      />

      <ConfirmDialog
        open={pending !== undefined}
        tone={pending?.outcome === 'cancel' ? 'destructive' : 'default'}
        title={pending?.outcome === 'cancel' ? copy.cancelConfirm.title : copy.receiveConfirm.title}
        description={
          pending === undefined
            ? undefined
            : pending.outcome === 'cancel'
              ? copy.cancelConfirm.body(pending.transfer.quantity, pending.transfer.origin.name)
              : copy.receiveConfirm.body(
                  pending.transfer.quantity,
                  pending.transfer.destination.name,
                )
        }
        confirmLabel={
          pending?.outcome === 'cancel' ? copy.cancelConfirm.confirm : copy.receiveConfirm.confirm
        }
        cancelLabel={copy.keep}
        closeLabel={copy.close}
        busy={settle.isPending}
        onConfirm={confirmSettlement}
        onClose={() => setPending(undefined)}
      />
    </TransfersCard>
  )
}
