import { Alert } from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from 'shared/components'

import { warehousesCopy } from '../../content'

import type { DeleteWarehouseDialogProps } from './DeleteWarehouseDialog.types'

const { remove } = warehousesCopy

/**
 * Confirmación de baja de un depósito. Mismo criterio que la baja de producto:
 * el rechazo se explica acá adentro y, si es el 409, la confirmación
 * desaparece porque reintentar va a fallar igual.
 */
export function DeleteWarehouseDialog({
  warehouse,
  deleting = false,
  blocker,
  failed = false,
  onConfirm,
  onClose,
}: DeleteWarehouseDialogProps) {
  // Durante el fundido de cierre `warehouse` ya es `undefined`: se recuerda el
  // último para que el texto no desaparezca mientras el diálogo se va.
  const [shown, setShown] = useState(warehouse)
  if (warehouse !== undefined && warehouse !== shown) setShown(warehouse)

  return (
    <ConfirmDialog
      open={warehouse !== undefined}
      tone="destructive"
      title={remove.title}
      description={shown === undefined ? undefined : remove.body(shown.name)}
      confirmLabel={remove.confirm}
      cancelLabel={remove.cancel}
      closeLabel={remove.close}
      busy={deleting}
      canConfirm={blocker === undefined}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      {blocker === undefined ? null : <Alert severity="error">{remove.blocked[blocker]}</Alert>}
      {failed && blocker === undefined ? <Alert severity="error">{remove.failed}</Alert> : null}
    </ConfirmDialog>
  )
}
